# PRIME weather media

These are lightweight local assets for the Weather Intelligence page. No Pexels footage was downloaded or included. The request to use Pexels was canceled because of file size.

## Delivery

Each silent WebM loop is 1280 × 720, 12 fps and approximately four seconds long. Matching JPEG posters provide a static fallback. All ten videos total **687,640 bytes**; all posters total **639,422 bytes**. The complete set is **1,327,062 bytes** (1.33 MB decimal). A single video is 55–98 KB; only the selected scene loads, with a short overlap during a scene transition.

| Scene | Video bytes | Poster bytes |
| --- | ---: | ---: |
| Clear day | 76,975 | 35,744 |
| Clear night | 55,371 | 30,494 |
| Cloudy day | 68,577 | 73,386 |
| Cloudy night | 97,610 | 69,014 |
| Fog | 72,522 | 59,218 |
| Rain day | 70,607 | 75,646 |
| Rain night | 68,378 | 71,681 |
| Snow | 56,100 | 74,732 |
| Storm / heavy rain | 59,701 | 76,121 |
| Wind | 61,799 | 73,386 |

The app applies grayscale, a light 2px blur and a black scrim. Mobile, reduced-motion and reduced-data users receive posters. Video playback pauses when offscreen or when the document is hidden; playback failure retains the poster. There is no audio, flashing lightning or runtime particle renderer.

## Source and authorship

Three source photographs were generated using the built-in **image_gen image generation tool**, in text-to-image mode. They are synthetic atmospheric photographs, not photographs of the selected city or live camera footage. No third-party stock media license or remote video host is required by these assets. Follow applicable OpenAI terms for generated content; this document makes no claim of exclusive copyright.

Local source outputs from this authoring session:

- Cloud: `C:/Users/hp/.codex/generated_images/01a191fb-3591-7ab0-aedf-2954a3c6528c/exec-3b1e735d-c34f-4899-88ae-230425aed03a.png`
- Clear day: `C:/Users/hp/.codex/generated_images/01a191fb-3591-7ab0-aedf-2954a3c6528c/exec-4058119d-b60b-47ba-a644-20f17f659122.png`
- Clear night: `C:/Users/hp/.codex/generated_images/01a191fb-3591-7ab0-aedf-2954a3c6528c/exec-59664776-591d-452a-9676-ea6168bb729d.png`

`scripts/weather/build-media.cjs` is an offline authoring utility. It uses the three paths in the ignored `.generated/weather/source-map.json` to create the delivered posters and loops. This utility is not imported into the application. The public files are self-contained; the original machine-specific source paths are not needed to run PRIME.

## Generation prompts

### Cloud

Create a premium cinematic weather BACKGROUND PHOTOGRAPH asset for the PRIME web application, no typography, no logo, no interface, no text, no people. Wide 16:9 composition. A vast layered overcast sky above a barely visible distant flat treeline, soft dramatic natural cloud banks, charcoal grey silver atmosphere, realistic delicate cloud texture, restrained subdued cool neutral colors, dusk daylight but enough soft cloud detail to be legible under a black scrim. Horizon in bottom 10 percent, clean atmospheric sky fills 90 percent. Film photographic naturalism, sophisticated quiet mood, no oversaturated blue, no lightning, no rain streaks, no mountains, no recognizable city. Optimized composition for a website background with white weather content over it. Save high resolution.

### Clear day

Create a cinematic photorealistic 16:9 background image for PRIME's clear DAY weather scene. No text, no UI, no logo, no people. Vast peaceful open sky at late afternoon, a few very faint wispy clouds, restrained natural soft sunlight from upper right, warm ivory silver-gray highlights, very muted blue-gray sky. Flat distant dark treeline only in bottom five percent. Clear weather, no dramatic storm clouds, no rain, no snow, no mountain. Elegant subtle tonal gradation, film photography, realistic texture. Weather web app will overlay white typography and a dark scrim; compose uncluttered sky space. No vivid saturated blue or orange, no lens flares.

### Clear night

Create a cinematic photorealistic 16:9 background image for PRIME's clear NIGHT weather scene. No text, no UI, no logo, no people. A quiet vast charcoal nighttime sky with a small realistic crescent moon in the upper right and a few delicate wispy clouds. Only a very sparse handful of dim stars, no galaxy, no Milky Way, no neon blue. Barely visible flat dark treeline at bottom five percent. Sophisticated film photography, rich black and neutral silver tones, subtle natural cloud detail, excellent ambient web application backdrop under white typography. No storm, no lightning, no city lights, no snow.
