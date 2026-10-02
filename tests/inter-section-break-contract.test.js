const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const keyboard = fs.readFileSync('keyboard.js', 'utf8');
const breakFidelity = fs.readFileSync('bluebook-break-fidelity.js', 'utf8');

assert(app.includes('if(s.screen==="break"){return false}'), 'exam navigation must block next/previous shortcuts during the timed break');
assert(app.includes('s.breakEndAt=null;save();if(s.harness){s.mi=2;s.qi=0;show("directions")}else{render()}'), 'actual break expiry must remain on the break surface until Resume Testing Now is selected');
assert(keyboard.includes('cannot bypass the timed inter-section break'), 'keyboard shortcut copy must not claim that Ctrl+P/Ctrl+O can bypass the timed break');
assert(breakFidelity.includes('id="azmResumeBtn"'), 'actual break surface must provide a resume control');
assert(breakFidelity.includes('current.screen !== \'break\''), 'resume handler must be scoped to the break screen');

console.log('Inter-section timed break contract passed.');
