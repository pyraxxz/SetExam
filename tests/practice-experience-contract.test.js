const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const previewStart = app.indexOf('function testPreview()');
const previewNav = app.indexOf('function navigateExamPage(direction)');
const bindStart = app.indexOf('function bind(){');
const previewBind = app.indexOf('if(s.screen==="testPreview")', bindStart);
const testBind = app.indexOf('if(s.screen==="test")', bindStart);

assert(previewStart >= 0, 'Test Preview renderer must exist');
assert(app.includes('function startTestPreview()'), 'Test Preview must have a real entry action');
assert(app.includes('function startFullLengthPractice()'), 'Full-Length Practice must have a real entry action');
assert(app.includes('previewIndex'), 'preview state must track the current sample question');
assert(app.includes('previewAnswers'), 'preview state must persist answers separately from exam answers');
assert(app.includes('previewNotes'), 'preview notes must be stored separately from exam notes');
assert(app.includes('previewAdvance(1)'), 'preview Next control must advance the preview');
assert(app.includes('No score or feedback is reported.'), 'Test Preview must remain explicitly unscored');
assert(app.includes('toolsBtn")?.addEventListener("click",tools)'), 'Test Preview must expose the normal More tools menu');
assert(app.includes('startFullLengthPractice'), 'dashboard Full-Length Practice must invoke the real practice flow');
assert(previewNav >= 0 && bindStart > previewNav, 'navigation function must precede bind lifecycle');
assert(previewBind >= bindStart && testBind > previewBind, 'preview event binding must live inside bind() before the test branch');
assert(!app.slice(previewNav, app.indexOf('function focusQ()', previewNav)).includes('addEventListener'), 'navigation function must not contain preview event binding');
assert(index.includes('tts-enhancement.js'), 'current preview must include embedded TTS support');

console.log('Practice Preview and lifecycle contract passed.');
