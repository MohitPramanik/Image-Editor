# Image Editor

Lightweight image editor built with React, TypeScript, Bootstrap and Fabric.js

## Use Cases
Use this app to crop, rotate, annotate, and export images for mockups, documentation, and quick edits without heavyweight desktop tools.

## Core Behavior
- To perform any action on an image, the image must be selected first.
- To perform any action on shapes, the shape(s) must be selected first.
- Fill mode on: newly created shapes are filled.
- Fill mode off: newly created shapes are outline-only.
- You can drag to select multiple items and delete them all at once.
- Zoom in/out updates the canvas view accordingly.
- Use the layer controls to move an object forward or backward in the stack.
- Export exports only the selected object(s). To export a specific set, select all of those objects on the canvas first.
- The Draw tool shows a brush-width input (range 1 to 10) so you can adjust stroke size.
- A Pan button appears on small screens to move the canvas horizontally when it overflows the viewport.

## Setup
1. Install dependencies:
```sh
npm install
```
2. Start the dev server:
```sh
npm run dev
```
3. Open the app at the local URL shown in your terminal.

## Build
```sh
npm run build
```

Live link: https://image-editor-eight-zeta.vercel.app/
