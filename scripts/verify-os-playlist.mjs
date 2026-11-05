// scripts/verify-os-playlist.mjs
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const PLAYLIST_ID = 'PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O';
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function verifyOembed(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              verified: true,
              title: parsed.title,
              authorName: parsed.author_name,
            });
          } catch {
            resolve({ verified: false, error: 'JSON parse error' });
          }
        } else {
          resolve({ verified: false, statusCode: res.statusCode });
        }
      });
    }).on('error', (err) => resolve({ verified: false, error: err.message }));
  });
}

async function run() {
  console.log(`Fetching playlist HTML from ${PLAYLIST_URL}...`);
  const html = await fetchText(PLAYLIST_URL);

  // Look for ytInitialData in HTML
  let initialData = null;
  const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);
  if (match) {
    try {
      initialData = JSON.parse(match[1]);
    } catch (e) {
      console.error('Failed to parse ytInitialData:', e.message);
    }
  }

  const extractedVideos = [];

  if (initialData) {
    console.log('Successfully found ytInitialData. Parsing playlist items...');
    try {
      // Traverse ytInitialData to find playlistVideoRenderer items
      const findVideos = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj.playlistVideoRenderer) {
          const item = obj.playlistVideoRenderer;
          const videoId = item.videoId;
          const title = item.title?.runs?.[0]?.text || item.title?.simpleText || '';
          const lengthText = item.lengthText?.simpleText || '';
          const index = item.index?.simpleText || (extractedVideos.length + 1).toString();
          extractedVideos.push({
            position: parseInt(index, 10) || (extractedVideos.length + 1),
            videoId,
            title,
            lengthText
          });
        }
        for (const key of Object.keys(obj)) {
          findVideos(obj[key]);
        }
      };
      findVideos(initialData);
    } catch (e) {
      console.error('Error traversing ytInitialData:', e);
    }
  }

  console.log(`Found ${extractedVideos.length} videos from ytInitialData traversal.`);

  // If initialData yielded fewer than 70 items (due to pagination or layout), let's also regex for "videoId":"..."
  if (extractedVideos.length < 70) {
    console.log('Falling back to regex video extraction...');
    const videoMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const seen = new Set();
    const regexVideos = [];
    for (const m of videoMatches) {
      const vid = m[1];
      if (!seen.has(vid)) {
        seen.add(vid);
        regexVideos.push(vid);
      }
    }
    console.log(`Unique video IDs found via regex: ${regexVideos.length}`);
  }

  // Save raw extraction for inspection
  fs.writeFileSync('scripts/os-raw-extracted.json', JSON.stringify(extractedVideos, null, 2));
  console.log('Saved raw extraction to scripts/os-raw-extracted.json');
}

run().catch(console.error);

