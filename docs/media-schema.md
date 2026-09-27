# Original practice media schema

Question records may include an optional `media` object. This is used only for original Azaman-authored practice content.

```js
media: {
  type: 'image',
  src: 'assets/media/example.svg',
  alt: 'A concise, meaningful description of the visual.',
  caption: 'Optional context shown below the visual.'
}
```

`type` is currently `image`. `src` must resolve to a same-origin `/assets/` or `/media/` path; external URLs and unsupported schemes are rejected by the runtime. `alt` is required so the inline image and enlarged viewer remain accessible. Captions are optional.

The viewer supports responsive inline display, an enlarged lightbox, zoom from 100% to 300%, reset, bounded pointer panning while zoomed, pinch zoom on touch devices, keyboard arrow panning while zoomed, plus/minus and modifier-wheel zoom, a trapped dialog focus cycle, and Escape to close. Reduced-motion preferences are respected by keeping the viewer free of required animation.

This feature intentionally does not embed College Board questions, charts, screenshots, or proprietary visual assets. The current Fall 2026 Bluebook public release notes document easier viewing of images, including zoom and pan. The repository currently exercises this with original rainfall-chart and triangle-area fixtures across Reading and Writing and Math. The repository implementation mirrors the interaction concept using original assets, not copied content.
