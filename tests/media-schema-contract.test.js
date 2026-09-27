const fs = require('fs');

const override = fs.readFileSync('data/media-overrides.js', 'utf8');
const script = fs.readFileSync('media-enhancement.js', 'utf8');
const touch = fs.readFileSync('media-touch-enhancement.js', 'utf8');
const docs = fs.readFileSync('docs/media-schema.md', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

for (const marker of ['type:', 'src:', 'alt:', 'caption:']) {
  if (!override.includes(marker)) throw new Error(`media override missing ${marker}`);
}
if (!override.includes("type: 'image'")) throw new Error('media override must use image type');
if (!override.includes("alt: '")) throw new Error('media override must provide non-empty alt text');
if (!override.includes('assets/media/rainfall-chart.svg')) throw new Error('R&W media fixture path missing');
if (!override.includes('assets/media/triangle-area.svg')) throw new Error('Math media fixture path missing');
if (!override.includes("math1?.find((item) => item.id === 'MM1Q7')")) throw new Error('Math media override target missing');
if (!script.includes("media.type !== 'image'")) throw new Error('media viewer must gate supported media types');
if (!script.includes('media.alt')) throw new Error('media viewer must require alt text');
if (!script.includes('url.origin === location.origin')) throw new Error('media viewer must reject external origins');
if (!script.includes("url.pathname.startsWith('/assets/')")) throw new Error('media viewer must allow asset paths');
if (!script.includes("url.pathname.startsWith('/media/')")) throw new Error('media viewer must allow media paths');
if (!script.includes('function mediaKey')) throw new Error('media viewer must derive a stable render key');
if (!script.includes('renderedMediaKey')) throw new Error('media viewer must prevent observer self-render loops');
if (!script.includes("event.key === 'Escape'")) throw new Error('media viewer must close with Escape');
if (!script.includes('__azmMediaState')) throw new Error('media viewer must expose shared interaction state');
if (!script.includes('aria-describedby')) throw new Error('media viewer must associate caption descriptions');
if (!script.includes('aria-labelledby',)) throw new Error('media viewer must expose a labelled dialog');
if (!script.includes('azm-media-open')) throw new Error('media viewer must lock page scrolling while open');
if (!script.includes('const clampPan')) throw new Error('media viewer must bound panning');
if (!script.includes("event.key === 'Tab'")) throw new Error('media viewer must trap keyboard focus');
if (!script.includes("addEventListener('wheel'")) throw new Error('media viewer must support wheel zoom interaction');
if (!touch.includes('overlay.__azmMediaState')) throw new Error('touch enhancement must use shared media viewer state');
if (!docs.includes('media: {')) throw new Error('media schema docs missing');
if (!docs.includes('same-origin')) throw new Error('media schema docs missing source safety rule');
if (!index.includes('data/media-overrides.js') || !index.includes('media-enhancement.js')) throw new Error('media scripts not wired into entrypoint');
if (!index.includes('media-touch-enhancement.js')) throw new Error('touch media script not wired into entrypoint');
if (!fs.existsSync('assets/media/rainfall-chart.svg')) throw new Error('R&W media fixture is missing');
if (!fs.existsSync('assets/media/triangle-area.svg')) throw new Error('Math media fixture is missing');

console.log('MEDIA SCHEMA CONTRACT PASSED');
