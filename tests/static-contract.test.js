const fs = require('fs');
const assert = require('assert');

const read = (p) => fs.readFileSync(p, 'utf8');
const html = read('index.html').replace(/\?v=\d+/g, '')
const app = read('app.js');
const guard = read('session-guard.js');
const keyboard = read('keyboard.js');
const spr = read('spr-input.js');
const tools = read('tools-enhancement.js');
const toolMove = read('tools-move-enhancement.js');
const notes = read('note-enhancement.js');
const modal = read('modal-enhancement.js');
const calculator = read('calculator-enhancement.js');
const codeInput = read('code-input-enhancement.js');
const results = read('results-enhancement.js');
const sanitizer = read('exam-ui-sanitizer.js');
const accessibility = read('tests/accessibility-contract.test.js');
const helpSmoke = read('tests/help-shortcut-smoke.html');
const fullRunSmoke = read('tests/full-run-smoke.html');
const mobileSmoke = read('tests/mobile-layout-smoke.html');
const uiA11y = read('ui-accessibility-enhancement.js');
const quality = read('data/question-quality-overrides.js');
const tokens = read('styles.css');
const platformReadiness = read('docs/platform-readiness.md');
const spec = read('docs/bluebook-spec.md');

const requiredScripts = [
  'data/questions.js', 'data/rw2-easy.js', 'data/rw-source-overrides.js', 'data/question-quality-overrides.js', 'session-guard.js', 'app.js', 'keyboard.js',
  'spr-input.js', 'tools-enhancement.js', 'note-enhancement.js', 'modal-enhancement.js', 'calculator-enhancement.js',
  'code-input-enhancement.js', 'results-enhancement.js', 'exam-ui-sanitizer.js', 'ui-accessibility-enhancement.js'
];
for (const src of requiredScripts) assert(html.includes(`src=\"${src}\"`), `index.html missing ${src}`);
assert(html.indexOf('data/rw-source-overrides.js') < html.indexOf('data/question-quality-overrides.js'), 'source overrides must load before quality overrides');
assert(html.indexOf('data/question-quality-overrides.js') < html.indexOf('app.js'), 'quality overrides must load before app.js');
assert(!html.includes('shortcut-enhancement.js'), 'obsolete duplicate shortcut layer must not be loaded');
assert(!html.includes('connectivity-enhancement.js'), 'non-authoritative connectivity UI must not be loaded');

for (const phrase of [
  'screen:\"access\"', 'show(\"break\")', 's.screen=\"finish\"', 'breakSec:600', 'warnSec:300',
  'minutes:32,count:27', 'minutes:35,count:22', 'completed[m().id]=true', 'routeNext()', 's.submitted=true',
  'Review questions', 'Question menu', 'Mark for Review', 'Reference sheet', 'Calculator', 'Line reader',
  'Highlights &amp; Notes', 'Hide timer'
]) assert(app.includes(phrase), `app.js missing contract: ${phrase}`);
for (const phrase of ['STORAGE_KEY', 'MODULES', 'state.submitted', 'state.completed', 'state.endAt <= Date.now()',
  'state.breakEndAt <= Date.now()', "state.screen = 'directions'", 'state.adaptive.rw', 'state.adaptive.math', "'checkin'"]) {
  assert(guard.includes(phrase), `session recovery contract missing: ${phrase}`);
}
for (const phrase of ['F1 (Windows/macOS/iPad)', 'Control + Search + S (ChromeOS)', 'F6', 'Ctrl + Alt + B', 'Ctrl + Alt + X', 'Ctrl + Alt + G', 'Ctrl + Alt + H', 'Command + Control + H',
  'Ctrl + Alt + Shift + D', 'Ctrl + L', 'Command + L', 'Ctrl + H', 'Ctrl + Alt + C', 'Command + Option + C', 'Ctrl + Alt + R',
  'Command + Option + R', 'Ctrl + Alt + O', 'Command + Control + O', 'Ctrl + Alt + 1–4', 'Command + Option + 1–4',
  'Ctrl + Shift + 1–4', 'Command + Control + 1–4', "document.getElementById('reviewBtn')?.click()", "clickText('Next') || clickText('Review module')", 'openHelp',
  'const isChromeOS', 'const isMac', 'const isIPad']) {
  assert(keyboard.includes(phrase), `keyboard shortcut missing: ${phrase}`);
}
for (const phrase of ['normalizeFraction', 'normalizeDecimal', 'blur', 'MAX_POSITIVE_CHARS', 'MAX_NEGATIVE_CHARS']) assert(spr.includes(phrase), `SPR normalization contract missing: ${phrase}`);
for (const phrase of ['setAttribute(\'role\', \'dialog\')', 'aria-modal', 'Resize calculator', 'makeResizable', 'restoreSavedHighlights']) assert(tools.includes(phrase), `tool enhancement contract missing: ${phrase}`);
for (const phrase of ["head.addEventListener('pointerdown'", "head.addEventListener('pointermove'", "head.addEventListener('pointerup'", 'ttsPanel']) assert(toolMove.includes(phrase), `tool movement contract missing: ${phrase}`);
for (const phrase of ['STORAGE_KEY', 'questionKey', 'saveNote', 'azmNoteEditor', 'stopImmediatePropagation']) assert(notes.includes(phrase), `note enhancement contract missing: ${phrase}`);
for (const phrase of ['FOCUSABLE', 'activeDialog', 'event.key !== \'Tab\'', 'aria-modal', 'focusFirst']) assert(modal.includes(phrase), `modal focus contract missing: ${phrase}`);
for (const phrase of ['tokenize(input)', 'sin', 'cos', 'tan', 'sqrt', 'log10', 'Graph', 'azmGraphExpr', 'azmXMin', 'azmXMax', 'getContext(\'2d\')', 'aria-controls="azmCalcCalculate"', 'aria-controls="azmCalcGraph"', 'Object.entries(views)', 'view.hidden = name !== mode']) assert(calculator.includes(phrase), `calculator enhancement contract missing: ${phrase}`);
for (const phrase of ['start-digit', 'paste', 'Backspace', 'ArrowLeft', 'ArrowRight', 'codeReady']) assert(codeInput.includes(phrase), `code-input enhancement contract missing: ${phrase}`);
for (const phrase of ['Your results', 'Reading and Writing', 'Math', 'raw results from your submitted answers', 'not an official SAT scaled score', 'results-section-grid', 'results-module-row']) assert(results.includes(phrase), `results enhancement contract missing: ${phrase}`);
for (const phrase of ['q-meta', 'source-label', 'hidden = true', 'aria-hidden', "textContent = 'Source'", 'MutationObserver', 'sanitize']) assert(sanitizer.includes(phrase), `student UI sanitizer contract missing: ${phrase}`);
for (const phrase of ['aria-live', 'aria-pressed', 'aria-modal', 'FOCUSABLE', 'aria-selected', 'aria-controls', 'Start code digit']) assert(accessibility.includes(phrase), `accessibility contract missing: ${phrase}`);
for (const phrase of ["setAttribute('role', 'radio')", "setAttribute('aria-checked'", "setAttribute('role', 'menu')", 'a11yReady', 'prefers-reduced-motion: reduce']) assert(uiA11y.includes(phrase) || accessibility.includes(phrase), `semantic accessibility contract missing: ${phrase}`);
assert(helpSmoke.includes("key: 'h', ctrlKey: true, altKey: true"), 'Help smoke must exercise Windows/ChromeOS Help');
assert(helpSmoke.includes('Command + Control + H'), 'Help smoke must verify the documented macOS Help shortcut');
assert(helpSmoke.includes('HELP SMOKE COMPLETE'), 'Help smoke must expose a machine-checkable completion marker');
for (const phrase of ['ChromeOS 144', 'macOS 15', 'iPadOS 18', 'Windows 11 24H2', 'support matrix']) assert(platformReadiness.includes(phrase), `platform readiness documentation missing: ${phrase}`);
for (const phrase of ['Review Device Requirements', 'Windows 11 24H2 or later', 'macOS 15 or later', 'iPadOS 18 or later', 'school-managed', 'verified mode enabled', 'ChromeOS Flex isn\'t supported']) assert(app.includes(phrase), `setup device requirements missing: ${phrase}`);
for (const phrase of ['Control + Search + S', 'ChromeOS', 'macOS', 'iPad', 'Command + Control + P', 'Setup/check-in state']) assert(spec.includes(phrase), `Bluebook platform spec missing: ${phrase}`);
for (const phrase of ['hash(value)', 'question.options = original.map', 'question.answer = letters', 'difficulty: \'hard\'']) assert(quality.includes(phrase), `question quality override missing: ${phrase}`);

assert(fullRunSmoke.includes('FULL RUN SMOKE COMPLETE'), 'full-run smoke must expose a machine-checkable completion marker');
for (const phrase of ['27', '22', 'rw1', 'rw2', 'math1', 'math2', 'adaptive.rw === \'hard\'', 'adaptive.math === \'hard\'', 'screen === \'break\'', 'screen === \'finish\'', 'Object.keys(next.answers).length === 98']) {
  assert(fullRunSmoke.includes(phrase), `full-run smoke missing coverage: ${phrase}`);
}
assert(mobileSmoke.includes('MOBILE LAYOUT SMOKE COMPLETE'), 'mobile smoke must expose a machine-checkable completion marker');
for (const phrase of ['scrollWidth', 'getBoundingClientRect', '#toolPopover', '#calculatorPanel', 'innerWidth']) assert(mobileSmoke.includes(phrase), `mobile smoke missing layout guard: ${phrase}`);

for (const token of ['--color-page:', '--color-surface:', '--color-text:', '--color-border:', '--color-primary:', '--color-warning:', '--color-focus:', '--color-selected:']) assert(tokens.includes(token), `visual token missing: ${token}`);
assert(!app.includes('Function('), 'unsafe Function() evaluator must not return');
assert(!app.includes('eval('), 'unsafe eval() evaluator must not return');
assert(!calculator.includes('Function('), 'calculator must not use Function()');
assert(!calculator.includes('eval('), 'calculator must not use eval()');

console.log('Static simulator contract checks passed.');
