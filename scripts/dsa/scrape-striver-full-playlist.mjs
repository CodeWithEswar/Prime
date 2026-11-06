import fs from 'fs';
import path from 'path';

function parseDurationText(label = '') {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const hMatch = label.match(/(\d+)\s*hour/i);
  if (hMatch) hours = parseInt(hMatch[1], 10);

  const mMatch = label.match(/(\d+)\s*minute/i);
  if (mMatch) minutes = parseInt(mMatch[1], 10);

  const sMatch = label.match(/(\d+)\s*second/i);
  if (sMatch) seconds = parseInt(sMatch[1], 10);

  if (hours > 0 || minutes > 0 || seconds > 0) {
    return hours * 3600 + minutes * 60 + seconds;
  }

  const timeCodeMatch = label.match(/(\d+):(\d+):(\d+)/);
  if (timeCodeMatch) {
    return parseInt(timeCodeMatch[1], 10) * 3600 + parseInt(timeCodeMatch[2], 10) * 60 + parseInt(timeCodeMatch[3], 10);
  }
  const minSecMatch = label.match(/(\d+):(\d+)/);
  if (minSecMatch) {
    return parseInt(minSecMatch[1], 10) * 60 + parseInt(minSecMatch[2], 10);
  }

  return 0;
}

async function scrapeSinglePlaylist(playlistId, playlistTitle) {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  console.log(`[Scraper] Fetching "${playlistTitle}" (${playlistId})...`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  const text = await res.text();
  const apiKeyMatch = text.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

  const ytInitialDataMatch = text.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                             text.match(/var ytInitialData\s*=\s*({.+?});/s);

  if (!ytInitialDataMatch || !apiKey) {
    console.error(`Failed to parse playlist ${playlistId}`);
    return [];
  }

  const data = JSON.parse(ytInitialDataMatch[1]);
  const sectionContents = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const initialItems = sectionContents[0]?.itemSectionRenderer?.contents || [];

  const rawVideos = [];
  let continuationToken = null;

  for (const item of initialItems) {
    if (item.lockupViewModel) {
      rawVideos.push(item.lockupViewModel);
    } else if (item.continuationItemViewModel) {
      continuationToken = item.continuationItemViewModel?.continuationCommand?.continuationCommand?.token ||
                          item.continuationItemViewModel?.continuationCommand?.token;
    }
  }

  let page = 1;
  while (continuationToken && page < 5) {
    page++;
    const apiUrl = `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`;
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US',
          }
        },
        continuation: continuationToken,
      })
    });

    const apiJson = await apiRes.json();
    continuationToken = null;

    const actions = apiJson.onResponseReceivedActions || [];
    for (const action of actions) {
      const items = action.appendContinuationItemsAction?.continuationItems || [];
      for (const item of items) {
        if (item.lockupViewModel) {
          rawVideos.push(item.lockupViewModel);
        } else if (item.continuationItemViewModel) {
          continuationToken = item.continuationItemViewModel?.continuationCommand?.continuationCommand?.token ||
                              item.continuationItemViewModel?.continuationCommand?.token;
        }
      }
    }
  }

  const list = [];
  for (const vm of rawVideos) {
    const videoId = vm.contentId ||
                    vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
    const title = vm.metadata?.lockupMetadataViewModel?.title?.content ||
                  vm.title?.content ||
                  '';
    const a11yLabel = vm.rendererContext?.accessibilityContext?.label || '';
    const durationSeconds = parseDurationText(a11yLabel);

    if (videoId && title) {
      list.push({
        youtubeVideoId: videoId,
        playlistId,
        playlistTitle,
        title: title.trim(),
        durationSeconds: durationSeconds > 0 ? durationSeconds : null,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        isAvailable: !title.toLowerCase().includes('[private') && !title.toLowerCase().includes('[deleted'),
      });
    }
  }

  console.log(`[Scraper] Fetched ${list.length} videos from "${playlistTitle}".`);
  return list;
}

export async function scrapeAllStriverA2Z() {
  const playlists = [
    { id: 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz', title: "Striver A2Z DSA Sheet - Core Roadmap" },
    { id: 'PLgUwDviBIf0pOd5zvVVSzgpo6BaCpHT9c', title: "Stack and Queue Playlist" },
    { id: 'PLgUwDviBIf0q7vrFA_HEWcqRqMpCXzYAL', title: "Two Pointer and Sliding Window Playlist" },
    { id: 'PLgUwDviBIf0rnqh8QsJaHyIX7KUiaPUv7', title: "Bit Manipulation Playlist" },
    { id: 'PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk', title: "Binary Trees & BST Series" },
    { id: 'PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn', title: "Graph Series & Algorithms" },
    { id: 'PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY', title: "Dynamic Programming Series" },
    { id: 'PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9', title: "Recursion & Backtracking" },
    { id: 'PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp', title: "Trie Series" },
  ];

  const allVideos = [];
  const seenIds = new Set();
  let unavailableCount = 0;

  for (const pl of playlists) {
    const vids = await scrapeSinglePlaylist(pl.id, pl.title);
    for (const v of vids) {
      if (!v.isAvailable) {
        unavailableCount++;
      }
      if (!seenIds.has(v.youtubeVideoId)) {
        seenIds.add(v.youtubeVideoId);
        allVideos.push({
          youtubeVideoId: v.youtubeVideoId,
          playlistId: v.playlistId,
          playlistTitle: v.playlistTitle,
          playlistPosition: allVideos.length + 1,
          title: v.title,
          durationSeconds: v.durationSeconds,
          youtubeUrl: v.youtubeUrl,
          thumbnailUrl: v.thumbnailUrl,
          availability: v.isAvailable ? 'available' : 'unavailable',
          topicId: null,
          mappingStatus: 'unmapped',
        });
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Verified Striver A2Z Videos Scraped: ${allVideos.length}`);
  console.log(`Unavailable/Private Videos: ${unavailableCount}`);
  console.log(`========================================\n`);

  const outDir = path.resolve(process.cwd(), 'data/striver-a2z');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'videos.json');
  fs.writeFileSync(outFile, JSON.stringify(allVideos, null, 2), 'utf-8');
  console.log(`Saved manifest to: ${outFile}`);

  return { total: allVideos.length, unavailableCount, videos: allVideos };
}

scrapeAllStriverA2Z().catch(console.error);
