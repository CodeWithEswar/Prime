// Offline authoring only. The application plays local videos; it has no canvas/particle engine.
// Usage: node scripts/weather/build-media.cjs path/to/source-map.json
// Source map: {"clear":"...png","cloud":"...png","night":"...png"}.
(async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { chromium } = await import("@playwright/test");
  const sources = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const base = path.resolve("public/weather");
  fs.mkdirSync(path.join(base, "posters"), { recursive: true });
  fs.mkdirSync(path.join(base, "video"), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent('<canvas width="1280" height="720"></canvas>');
  const scenes = [
    "clear-day",
    "clear-night",
    "cloudy-day",
    "cloudy-night",
    "rain-day",
    "rain-night",
    "storm",
    "fog",
    "wind",
    "snow",
  ];
  for (const id of scenes) {
    const source =
      id === "clear-night" ? "night" : id === "clear-day" ? "clear" : "cloud";
    const data =
      "data:image/png;base64," + fs.readFileSync(sources[source]).toString("base64");
    const output = await page.evaluate(
      async ({ id, data }) => {
        const image = new Image();
        image.src = data;
        await image.decode();
        const canvas = document.querySelector("canvas"),
          ctx = canvas.getContext("2d");
        const w = 1280,
          h = 720;
        const draw = (phase) => {
          const night = id.includes("night") || id === "storm";
          ctx.fillStyle = "#080808";
          ctx.fillRect(0, 0, w, h);
          ctx.filter = `grayscale(${id.startsWith("clear") ? 0.3 : 0.65}) brightness(${night ? (id === "clear-night" ? 1 : 0.9) : id === "fog" ? 0.9 : 1})`;
          const scale = Math.max(w / image.width, h / image.height) * 1.06,
            dx = Math.sin(phase * Math.PI * 2) * (id === "wind" ? 25 : 6);
          ctx.drawImage(
            image,
            (w - image.width * scale) / 2 + dx,
            (h - image.height * scale) / 2,
            image.width * scale,
            image.height * scale
          );
          ctx.filter = "none";
          if (id.startsWith("rain") || id === "storm") {
            ctx.strokeStyle = id === "storm" ? "#dce3eb55" : "#dce3eb38";
            ctx.lineWidth = 0.8;
            for (let i = 0; i < (id === "storm" ? 230 : 130); i++) {
              const x = (i * 293.73) % w,
                y = (i * 123.17 + phase * h * 3) % h;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x - 10, y + 26);
              ctx.stroke();
            }
          }
          if (id === "fog") {
            const fog = ctx.createLinearGradient(0, 100, 0, h);
            fog.addColorStop(0, "#d2d2d200");
            fog.addColorStop(0.6, "#d2d2d248");
            fog.addColorStop(1, "#d2d2d265");
            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, w, h);
          }
          if (id === "snow") {
            ctx.fillStyle = "#ffffff99";
            for (let i = 0; i < 80; i++) {
              const x = (i * 177.19 + Math.sin(phase * 2 * Math.PI) * 20) % w,
                y = (i * 91.7 + phase * h) % h;
              ctx.beginPath();
              ctx.arc(x, y, 1 + (i % 3) * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        };
        draw(0);
        const poster = canvas.toDataURL("image/jpeg", 0.76).split(",")[1];
        const stream = canvas.captureStream(12),
          chunks = [];
        const type = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm";
        const recorder = new MediaRecorder(stream, {
          mimeType: type,
          videoBitsPerSecond: 420000,
        });
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        const finished = new Promise((resolve) => (recorder.onstop = resolve));
        recorder.start();
        const start = performance.now();
        await new Promise((resolve) => {
          const timer = setInterval(() => {
            const elapsed = performance.now() - start;
            if (elapsed >= 4000) {
              clearInterval(timer);
              resolve();
            } else draw(elapsed / 4000);
          }, 1000 / 12);
        });
        recorder.stop();
        await finished;
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "video/webm" }),
          buffer = new Uint8Array(await blob.arrayBuffer());
        let binary = "";
        for (let i = 0; i < buffer.length; i += 8192)
          binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
        return { poster, video: btoa(binary) };
      },
      { id, data }
    );
    fs.writeFileSync(
      path.join(base, "posters", id + ".jpg"),
      Buffer.from(output.poster, "base64")
    );
    fs.writeFileSync(
      path.join(base, "video", id + ".webm"),
      Buffer.from(output.video, "base64")
    );
    console.log(id, fs.statSync(path.join(base, "video", id + ".webm")).size, "bytes");
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
