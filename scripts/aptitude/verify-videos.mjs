import fs from "node:fs";
const file = "content/aptitude/video-catalog.json";
const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
const entries = Object.entries(catalog).filter(
  ([, item]) => !process.argv.includes("--pending") || item.sourceCheck?.status !== 200
);
let available = 0;
const failures = [];
for (let start = 0; start < entries.length; start += 4) {
  await Promise.all(
    entries.slice(start, start + 4).map(async ([id, item]) => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error("Invalid video ID: " + id);
      const checkedAt = new Date().toISOString();
      const url =
        "https://www.youtube.com/oembed?url=" +
        encodeURIComponent("https://www.youtube.com/watch?v=" + id) +
        "&format=json";
      let status = null;
      let error = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(url, {
            headers: { "user-agent": "Mozilla/5.0", connection: "close" },
            signal: AbortSignal.timeout(12000),
          });
          status = response.status;
          if (response.ok) {
            const data = await response.json();
            Object.assign(item, {
              videoId: id,
              title: data.title,
              channelTitle: data.author_name,
              canonicalUrl: "https://www.youtube.com/watch?v=" + id,
              sourceCheck: {
                endpoint: url,
                checkedAt,
                status,
                scope:
                  "Public oEmbed metadata; not a playback, spoken-language, or full-coverage certification.",
              },
            });
            if (!item.durationSeconds && item.durationFormatted)
              item.durationSeconds = item.durationFormatted
                .split(":")
                .reduce((total, part) => total * 60 + Number(part), 0);
            available++;
            return;
          }
          if ([400, 401, 403, 404].includes(status)) break;
        } catch (e) {
          error = e.message;
        }
      }
      item.sourceCheck = { endpoint: url, checkedAt, status, error };
      failures.push({ videoId: id, status, error });
    })
  );
  fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + "\n");
  console.log(Math.min(start + 4, entries.length) + "/" + entries.length + " checked");
}
console.log(JSON.stringify({ available, failures }, null, 2));
if (failures.length) process.exitCode = 1;
