import fs from "node:fs";
const queries = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const output = process.argv[3] ?? ".generated/aptitude-search-results.json";
const results = {};
const concurrency = Number(process.argv[4] ?? 2);
for (let start = 0; start < queries.length; start += concurrency) {
  await Promise.all(
    queries.slice(start, start + concurrency).map(async ({ key, query }) => {
      try {
        const response = await fetch(
          "https://www.youtube.com/results?search_query=" + encodeURIComponent(query),
          {
            headers: {
              "user-agent": "Mozilla/5.0",
              "accept-language": "en-US,en;q=0.9",
              connection: "close",
            },
            signal: AbortSignal.timeout(20000),
          }
        );
        const html = await response.text();
        const match = html.match(/var ytInitialData = (.*?);<\/script>/s);
        if (!match) throw new Error("No public video results returned");
        const data = JSON.parse(match[1]);
        const videos = [];
        function walk(node) {
          if (!node || typeof node !== "object") return;
          if (node.videoRenderer) {
            const v = node.videoRenderer;
            if (!videos.some((item) => item.videoId === v.videoId))
              videos.push({
                videoId: v.videoId,
                title: v.title?.runs?.map((r) => r.text).join("") ?? "",
                channelTitle: v.ownerText?.runs?.map((r) => r.text).join("") ?? "",
                durationFormatted: v.lengthText?.simpleText ?? null,
              });
          }
          for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(walk);
            else if (value && typeof value === "object") walk(value);
          }
        }
        walk(data);
        results[key] = {
          query,
          checkedAt: new Date().toISOString(),
          videos: videos.slice(0, 8),
        };
        console.log(key + ": " + videos.length + " results");
      } catch (error) {
        results[key] = { query, error: error.message, videos: [] };
        console.log(key + ": " + error.message);
      }
    })
  );
  fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n");
}
