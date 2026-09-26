# Pezzi

An original browser-based mosaic playground with a landing page and a frame-by-frame studio.

The landing page features five short object-focused mosaic loops, generated with the same renderer used by the studio. Their source cutouts and resulting WebM loops live under `public/objects` and `public/demos`.

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` for the landing page and `http://127.0.0.1:5173/studio` for the studio. Run `npm run build` to create a production bundle.

The footer links to `/privacy` and `/terms`. These pages describe the current browser-only processing and studio behavior. Add the operator's name and contact details before a public launch.

## Studio

- Choose a shape style, tile size, palette, and canvas ratio.
- Remix a design or import an image to influence tile colors.
- Import an MP4, MOV, M4V, or WebM clip. The studio probes its duration and frame rate, then turns the first 150 frames into editable mosaic frames. Browser codec support determines which clips can open.
- Add, duplicate, and remove frames; preview a sequence.
- Adjust playback speed in FPS.
- Export a PNG or a WebM loop. WebM requires browser support for `MediaRecorder` and canvas capture.

Media is processed locally in the browser. The project uses Next.js App Router, React, TypeScript, Mediabunny for video frame-rate inspection, and a canvas renderer written for Pezzi. There is no backend or account.
