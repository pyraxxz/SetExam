const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('calculator-enhancement.js', 'utf8');
const moveSource = fs.readFileSync('tools-move-enhancement.js', 'utf8');
const smoke = fs.readFileSync('tests/calculator-resize-smoke.html', 'utf8');
const workflow = fs.readFileSync('.github/workflows/calculator-resize-smoke.yml', 'utf8');

assert(!/\beval\s*\(/.test(source), 'calculator must not use eval');
assert(!/\bFunction\s*\(/.test(source), 'calculator must not use Function constructor');
assert(source.includes('Math.pow'), 'calculator must support exponentiation');
assert(source.includes("['sin',"), 'calculator must support sine');
assert(source.includes("['asin',"), 'calculator must support inverse sine');
assert(source.includes("['sqrt',"), 'calculator must support square roots');
assert(source.includes("['log', Math.log10]"), 'calculator must support common logarithms');
assert(source.includes("['ln', Math.log]"), 'calculator must support natural logarithms');
assert(source.includes("['tan', tanDegrees]"), 'calculator must use a guarded tangent implementation');
assert(source.includes('tan undefined'), 'calculator must reject undefined tangent values');
assert(source.includes('Implicit multiplication'), 'calculator must document implicit multiplication');
assert(source.includes('const unary = ()'), 'calculator must parse unary signs');
assert(source.includes('return power();'), 'calculator must give exponentiation a dedicated precedence layer');
assert(source.includes('x from ${xmin} to ${xmax}'), 'graphing mode must report its plotted range');
assert(moveSource.includes('Pointer dragging mirrors the current Bluebook floating-tool behavior.'), 'floating tools must support pointer dragging');
assert(moveSource.includes("head.addEventListener('pointerdown'"), 'floating tools must bind pointerdown dragging');
assert(moveSource.includes("head.addEventListener('pointermove'"), 'floating tools must bind pointermove dragging');
assert(moveSource.includes("head.addEventListener('pointerup'"), 'floating tools must bind pointerup dragging');
assert(moveSource.includes('setPointerCapture'), 'floating tools must capture the active pointer while dragging');
assert(moveSource.includes('azm-tool-dragging'), 'floating tools must expose a dragging state for UI feedback');
assert(source.includes('xmax - xmin > 200'), 'graphing mode must reject unbounded ranges');
assert(source.includes("panel.dataset.dragReady = '0'"), 'calculator rewrite must reset drag enhancement state');
assert(source.includes("panel.dataset.resizeReady = '0'"), 'calculator rewrite must reset resize enhancement state');
assert(source.includes("panel.dataset.focusReady = '0'"), 'calculator rewrite must reset focus enhancement state');
assert(smoke.includes('resize-handle'), 'calculator resize smoke must exercise resize handle');
assert(smoke.includes('CALCULATOR RESIZE SMOKE COMPLETE'), 'calculator resize smoke completion marker missing');
assert(workflow.includes('calculator-resize-smoke.html'), 'calculator resize workflow must run dedicated smoke');
assert(workflow.includes("'tools-move-enhancement.js'"), 'calculator resize workflow must rerun when floating-tool drag code changes');

console.log('Calculator safety, capability, and resize contract passed.');
