'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const index = read('index.html');
const app = read('app.js');
const keyboard = read('keyboard.js');
const css = read('bluebook-fidelity-refinements.css');
const pixelCss = read('bluebook-pixel-fidelity.css');
const js = read('bluebook-fidelity-refinements.js');
const finalCss = read('bluebook-final-calibration.css');
const finalJs = read('bluebook-final-calibration.js');
const examCss = read('bluebook-exam-mode.css');
const examJs = read('bluebook-exam-mode.js');
const finalizationJs = read('bluebook-exam-finalization.js');
const breakCss = read('bluebook-break-fidelity.css');
const breakJs = read('bluebook-break-fidelity.js');
const mvpJs = read('bluebook-mvp-runtime.js');
const transitionJs = read('bluebook-module-transition.js');
const lineReaderJs = read('line-reader-enhancement.js');
const sw = read('sw.js');

for (const asset of ['bluebook-fidelity-overrides.css','bluebook-fidelity-refinements.css','bluebook-exam-mode.css','bluebook-break-fidelity.css','bluebook-pixel-fidelity.css','bluebook-final-calibration.css','bluebook-fidelity-enhancement.js','bluebook-fidelity-refinements.js','bluebook-exam-mode.js','bluebook-module-transition.js','bluebook-break-fidelity.js','bluebook-mvp-runtime.js','bluebook-final-calibration.js']) {
  if (!index.includes(`href="${asset}"`) && !index.includes(`href="${asset}?`) && !index.includes(`src="${asset}"`) && !index.includes(`src="${asset}?`)) throw new Error(`index.html does not load ${asset}`);
}
if (index.includes('bluebook-final-visual-flow.css')) throw new Error('obsolete duplicate visual flow layer is still loaded');
for (const selector of ['.ref2-access-brand','.test-main','.test-footer','#atModal','.azm-module-transition']) if (!css.includes(selector)) throw new Error(`missing fidelity selector: ${selector}`);
for (const selector of ['.test-top','.timer-block','.question-nav','.test-footer','.test-main','.code-input','.azm-break-device-status','.yt-welcome','.test-links','.azm-start-code-page','.azm-directions-page']) if (!pixelCss.includes(selector)) throw new Error(`missing pixel calibration selector: ${selector}`);
for (const text of ['Test Your Device','Assistive Technology','This Module Is Over','Expand All','Collapse All','moduleTransitions','actualStartCodeSurface','actualDirectionsSurface','Start Test','Continue','This Device Meets the Requirements','Memory','Operating system','Disk space','Device lock','Verified mode']) if (!js.includes(text)) throw new Error(`missing fidelity behavior: ${text}`);
for (const text of ['MathJax','Link to Referenced Content','Zoom and Magnification','Screen Readers','Text-to-Speech']) if (!finalJs.includes(text)) throw new Error(`missing current AT categories: ${text}`);
for (const selector of ['.bb-final-device-card','.bb-final-device-row','.bb-final-at-card','#deviceTestDialog']) if (!finalCss.includes(selector) && selector !== '#deviceTestDialog') throw new Error(`missing final calibration selector: ${selector}`);
if (!finalJs.includes('deviceTestDialog') || !finalJs.includes('ref2DeviceDialog')) throw new Error('final calibration must handle both legacy device-check dialog surfaces');
for (const [text, source] of [['Take a Break: Do Not Close Your Device',breakCss+breakJs],['Resume Testing Now',breakCss+breakJs],['Follow these rules during the break:',breakJs],['This Module Is Over',transitionJs],['moduleSec',mvpJs],['Congratulations!',finalizationJs],['Return to Homepage',finalizationJs]]) if (!source.includes(text)) throw new Error(`missing MVP runtime behavior: ${text}`);
for (const [text, source] of [['Section ${secNum}, Module ${s.mi+1}: ${esc(sec)} Questions',app],['Question Status',app],['reviewDismiss',app],['examSplitter',app],['Ctrl + P',keyboard],['Ctrl + O',keyboard],['Test Preview',app],['practiceTabActive',app],['practiceLearnBtn',app],['previewIndex',app],['startTestPreview',app],['startFullLengthPractice',app],['goReviewPage',app],['azmDirectionsClock',js]]) if (!source.includes(text)) throw new Error(`missing new fidelity behavior: ${text}`);
for (const text of ['Section ${section}: ${name}','Section ${section}, Module ${module}: ${name}','multiple-choice questions','You can move back and forth between questions until time expires.','Once the next module begins, you cannot return to these questions.','const minutes = state.mi >= 2 ? 35 : 32','const moduleId = index === 0 ? \'rw1\' : index === 1 ? \'rw2\' : index === 2 ? \'math1\' : \'math2\'','state.endAt = Date.now() + minutes * 60 * 1000','actualModeDirectionsContinue']) if (!examJs.includes(text)) throw new Error(`missing official exam wording/timer behavior: ${text}`);
if (!pixelCss.includes('.test-top:after') || !pixelCss.includes('content:"100%"')) throw new Error('exam header must retain the Bluebook zoom indicator');
if (!examCss.includes('body:not(.azm-harness) .preview-banner')) throw new Error('actual exam model must suppress preview-only chrome outside QA harness');
if (!examJs.includes('actualModeAdvanceGuard') || !examJs.includes('Review module')) throw new Error('actual exam model must gate early module advance');
if (!finalizationJs.includes('isActualRuntime') || !finalizationJs.includes('mountRecoveryNotice')) throw new Error('actual runtime recovery/finalization layer is missing');
if (!lineReaderJs.includes('state.cleanup') || !lineReaderJs.includes('removeEventListener')) throw new Error('Line Reader enhancement must clean up listeners across rerenders');
if (!sw.includes('bluebook-fidelity-refinements.css') || !sw.includes('bluebook-exam-mode.js')) throw new Error('offline cache is missing fidelity assets');
for (const asset of ['bluebook-break-fidelity.css','bluebook-break-fidelity.js','bluebook-module-transition.js','bluebook-mvp-runtime.js','bluebook-pixel-fidelity.css','line-reader-enhancement.js','bluebook-final-calibration.css','bluebook-final-calibration.js']) if (!sw.includes(asset)) throw new Error(`offline cache is missing MVP asset: ${asset}`);
if (!sw.includes("const CACHE_NAME='azaman-bluebook-v25'")) throw new Error('offline cache version does not match current precache generation');
for (const [token, source] of [['#d5e8df',pixelCss],['#f0d34f',finalCss],['#55bfdc',finalCss],['--azm-exam-source-width',finalCss],['.exam-splitter',finalCss],['.review-q.current',finalCss]]) if (!source.includes(token)) throw new Error(`missing calibrated visual token: ${token}`);
if (!sw.includes('caches.match(r).then(c=>')) throw new Error('service worker is not cache-first');
if (sw.includes('fetch(request)')) throw new Error('exam service worker must not depend on a runtime network fallback');
new Function(js);new Function(finalJs);new Function(examJs);new Function(finalizationJs);new Function(breakJs);new Function(mvpJs);new Function(transitionJs);new Function(lineReaderJs);
console.log('FIDELITY REFINEMENT CONTRACT PASS');
