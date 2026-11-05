// scripts/sync-manifest-paths.mjs
import fs from 'node:fs';

fs.mkdirSync('content/fundamentals/os', { recursive: true });
fs.copyFileSync('content/os/neso-video-manifest.json', 'content/fundamentals/os/neso-playlist.json');
fs.copyFileSync('content/os/supplementary-manifest.json', 'content/fundamentals/os/supplementary-manifest.json');
fs.copyFileSync('content/os/os-exercises.json', 'content/fundamentals/os/os-exercises.json');

console.log('Synchronized content/fundamentals/os/ with content/os/');

