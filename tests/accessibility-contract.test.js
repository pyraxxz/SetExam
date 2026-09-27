const fs = require('fs');
const assert = require('assert');

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('index.html');
const app = read('app.js');
const keyboard = read('keyboard.js');
const modal = read('modal-enhancement.js');
const calculator = read('calculator-enhancement.js');
const codeInput = read('code-input-enhancement.js');
const uiA11y = read('ui-accessibility-enhancement.js');
const media = read('media-enhancement.js');
const tts = read('tts-enhancement.js');
const toolMove = read('tools-move-enhancement.js');

assert(html.includes('<html lang="en">'), 'document language must be declared');
assert(app.includes('aria-live'), 'application status region must expose live updates');
assert(app.includes('aria-label="Answer choices"'), 'answer-choice group must be labelled');
assert(app.includes('aria-pressed'), 'selected choices must expose pressed state');
assert(app.includes('aria-labelledby="warnTitle"'), 'timer warning must have an accessible name');
assert(keyboard.includes('role="dialog"'), 'shortcut dialog must expose dialog role');
assert(keyboard.includes('openHelp'), 'help shortcut must have a dedicated help dialog');
for (const shortcut of [
  'F1 (Windows/macOS/iPad)', 'Control + Search + S (ChromeOS)',
  'Ctrl + Alt + H / Command + Control + H / iPad: Command + Control + P',
  'Ctrl + Alt + B / Command + Control + B',
  'Ctrl + Alt + X / Command + Control + X',
  'Ctrl + Alt + G / Command + Control + G',
  'Ctrl + Alt + Shift + D / Command + Control + Shift + D',
  'Ctrl + L / Command + L',
  'Ctrl + Alt + T / Command + Option + T',
  'Ctrl + Alt + V / Command + Shift + V',
  'Ctrl + Alt + C / Command + Option + C',
  'Ctrl + Alt + R / Command + Option + R',
  'Ctrl + Alt + O / Command + Control + O',
  'Ctrl + Alt + 1–4 / Command + Option + 1–4',
  'Ctrl + Shift + 1–4 / Command + Control + 1–4'
]) assert(keyboard.includes(shortcut), `platform shortcut must be documented: ${shortcut}`);
assert(keyboard.includes('const isChromeOS'), 'ChromeOS-specific shortcut routing must detect CrOS');
assert(keyboard.includes('const isMac'), 'platform-specific shortcut routing must detect Apple platforms');
assert(keyboard.includes('const isIPad'), 'iPad-specific shortcut routing must be supported');
assert(keyboard.includes('const triple = isMac ? command && ctrl : ctrl && alt'), 'shared Control/Command chord must follow platform mapping');
assert(keyboard.includes('const comboAlt = isMac ? command && alt : ctrl && alt'), 'Option/Alt chord must follow platform mapping');
assert(keyboard.includes("isChromeOS && ctrl && command && lower === 's'"), 'ChromeOS keyboard shortcut list must open with Control+Search+S');
assert(keyboard.includes("isIPad && command && ctrl && lower === 'p'"), 'iPad Help must use Command+Control+P');
assert(keyboard.includes("isMac ? command && event.shiftKey && lower === 'v' : ctrl && alt && lower === 'v'"), 'Mark for Review must use the platform-specific mapping');
assert(keyboard.includes('function toggleDialogById(id, opener)'), 'toolbar shortcuts must have reusable open/close semantics');
assert(keyboard.includes("toggleDialogById('reviewModal'"), 'Question Menu shortcut must close an already-open review dialog');
assert(keyboard.includes("toggleDialogById('calculatorPanel'"), 'Calculator shortcut must toggle the dialog');
assert(keyboard.includes("toggleDialogById('referencePanel'"), 'Reference Sheet shortcut must toggle the dialog');
assert(keyboard.includes('const existing = document.getElementById(\'directionHelp\')'), 'Directions shortcut must support open/close semantics');
assert(modal.includes('role="dialog"'), 'modal focus layer must target dialog semantics');
assert(modal.includes('aria-modal="true"'), 'dialogs must be modal to assistive technology');
assert(modal.includes('FOCUSABLE'), 'dialogs must define keyboard focusable controls');
assert(calculator.includes('aria-controls="azmCalcCalculate"'), 'calculator tabs must expose calculate panel relationship');
assert(calculator.includes('aria-controls="azmCalcGraph"'), 'calculator tabs must expose graph panel relationship');
assert(calculator.includes('aria-selected'), 'calculator tabs must expose selection state');
assert(codeInput.includes('setAttribute(\'aria-label\''), 'start-code fields must receive individual accessible labels');
assert(codeInput.includes('Start code digit ${index + 1} of 6'), 'start-code labels must identify each digit position');
assert(uiA11y.includes("setAttribute('role', 'radio')"), 'answer choices must expose radio semantics');
assert(uiA11y.includes("setAttribute('aria-checked'"), 'answer choices must expose checked state');
assert(uiA11y.includes("setAttribute('role', 'menu')"), 'test tools must expose menu semantics');
assert(uiA11y.includes('Question ${number}, ${states.join'), 'review buttons must have descriptive labels');
assert(uiA11y.includes("setAttribute('role', 'timer')"), 'test and break timers must expose timer semantics');
assert(uiA11y.includes("timer.setAttribute('aria-label', 'Test timer')"), 'main test timer must expose an accessible label');
assert(uiA11y.includes("setAttribute('aria-live', 'off')"), 'timers must not spam live-region announcements');
assert(uiA11y.includes("top.setAttribute('aria-label', 'Bluebook Controls')"), 'test controls must expose a named banner region');
assert(uiA11y.includes("source.setAttribute('aria-label', 'Passage or Source')"), 'source region must expose its landmark name');
assert(uiA11y.includes("question.setAttribute('aria-label', 'Question and Answer')"), 'question region must expose its landmark name');
assert(uiA11y.includes("footer.setAttribute('aria-label', 'Question Navigation')"), 'navigation footer must expose its landmark name');
assert(uiA11y.includes('installReducedMotionSupport'), 'reduced-motion preference must have a dedicated accessibility path');
assert(uiA11y.includes('prefers-reduced-motion: reduce'), 'reduced-motion preference must be honored');
assert(uiA11y.includes('childList: true, subtree: true'), 'accessibility observer must react to rendered subtrees');
assert(!uiA11y.includes("attributeFilter: ['class', 'aria-pressed']"), 'accessibility observer must not observe attributes it mutates');
assert(uiA11y.includes("clock.setAttribute('role', 'timer')"), 'break timer must expose timer semantics');
assert(uiA11y.includes("clock.setAttribute('aria-label', 'Break time remaining')"), 'break timer must expose an accessible label');
assert(media.includes("setAttribute('role', 'dialog')"), 'media viewer must create dialog semantics');
assert(media.includes("setAttribute('aria-modal', 'true')"), 'media viewer must expose modal semantics');
assert(media.includes('aria-describedby'), 'media viewer must associate captions with the viewport');
assert(media.includes('aria-label'), 'media viewer controls must be labelled');
assert(toolMove.includes('aria-pressed'), 'tool Move button must expose pressed state');
assert(toolMove.includes('ArrowLeft') && toolMove.includes('ArrowRight'), 'tool Move must support horizontal keyboard movement');
assert(toolMove.includes('ArrowUp') && toolMove.includes('ArrowDown'), 'tool Move must support vertical keyboard movement');
assert(html.includes('ui-accessibility-enhancement.js'), 'semantic accessibility enhancement must be loaded');
assert(html.includes('media-enhancement.js'), 'media accessibility enhancement must be loaded');
assert(html.includes('tools-move-enhancement.js'), 'keyboard tool movement enhancement must be loaded');
assert(html.includes('media-touch-enhancement.js'), 'touch media enhancement must be loaded');
assert(html.includes('tts-enhancement.js'), 'embedded TTS enhancement must be loaded');
assert(tts.includes('Play All'), 'TTS must expose Play All');
assert(tts.includes('Click Mode'), 'TTS must expose Click Mode');
assert(tts.includes('Stop'), 'TTS must expose Stop');
assert(tts.includes('ttsSpeed'), 'TTS must expose speed control');
assert(tts.includes('ttsVolume'), 'TTS must expose volume control');
assert(toolMove.includes('Move Text-to-Speech'), 'TTS must expose move control through the dedicated tool movement layer');
assert(tts.includes('azm-tts-collapsed'), 'TTS must support collapse/expand');
assert(tts.includes('speechSynthesis'), 'TTS must use the browser speech synthesis API locally');
assert(tts.includes('aria-live="polite"'), 'TTS status must announce playback state');

console.log('Accessibility, reduced-motion, media, tool movement, touch, platform shortcuts, toggle semantics, timer labels, landmarks, and observer safety contract checks passed.');
