const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function loadBank() {
  const sandbox = { window: {} };
  for (const path of ['data/questions.js', 'data/rw2-easy.js', 'data/rw-source-overrides.js', 'data/question-quality-overrides.js']) {
    vm.runInNewContext(fs.readFileSync(path, 'utf8'), sandbox);
  }
  return sandbox.window.SAT_QUESTIONS;
}

const bank = loadBank();
const groups = [
  ['rw1', bank.rw1], ['rw2.easy', bank.rw2.easy], ['rw2.hard', bank.rw2.hard],
  ['math1', bank.math1], ['math2.easy', bank.math2.easy], ['math2.hard', bank.math2.hard]
];

const seenIds = new Set();
const exactSignatures = new Set();
const issues = [];
const shortPassageIds = [];
const forbiddenRwLabels = [];
const genericRwPrompts = [];
const terseRwPrompts = [];
const genericRwPattern = /^(which choice best states the (main|central) idea|which choice best states the main point|which inference is best supported|which conclusion is best supported by the results|which conclusion can be reasonably drawn from the passage|which choice most accurately captures the passage’s central idea|which choice best summarizes the notes about the lecture)\??$/i;

for (const [group, items] of groups) {
  assert(Array.isArray(items), `${group} is not an array`);
  items.forEach((question, index) => {
    const location = `${group}[${index}] ${question.id || 'missing-id'}`;
    if (!question.id) issues.push(`${location}: missing id`);
    if (seenIds.has(question.id)) issues.push(`${location}: duplicate id`);
    seenIds.add(question.id);
    if (!question.prompt?.trim()) issues.push(`${location}: missing prompt`);
    if (!question.explanation?.trim()) issues.push(`${location}: missing explanation`);
    if (question.section === 'Reading and Writing') {
      const paragraphs = question.source?.paragraphs || [];
      const words = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;
      if (words < 45) shortPassageIds.push(question.id);
      if (/practice|placeholder|synthetic|original azaman/i.test(question.source?.title || '')) forbiddenRwLabels.push(`${location}: ${question.source.title}`);
      if (genericRwPattern.test(question.prompt || '')) genericRwPrompts.push(`${location}: ${question.prompt}`);
      if ((question.prompt || '').trim().split(/\s+/).filter(Boolean).length < 7) terseRwPrompts.push(`${location}: ${question.prompt}`);
      if (words > 150) issues.push(`${location}: source exceeds 150 words`);
      if (!paragraphs.length) issues.push(`${location}: missing source passage`);
      if (!Array.isArray(question.options) || question.options.length !== 4) issues.push(`${location}: expected 4 R&W options`);
    }
    if (question.section === 'Math' && question.type === 'mcq' && (!Array.isArray(question.options) || question.options.length !== 4)) issues.push(`${location}: expected 4 Math options`);
    if (question.section === 'Math' && question.type === 'spr' && question.options?.length) issues.push(`${location}: SPR contains options`);
    const signature = JSON.stringify({ section: question.section, type: question.type || 'mcq', prompt: question.prompt, options: question.options || [], answer: question.answer, source: question.source || null });
    if (exactSignatures.has(signature)) issues.push(`${location}: exact duplicate item`);
    exactSignatures.add(signature);
  });
}

assert.equal(issues.length, 0, `content integrity issues:\n${issues.join('\n')}`);
assert.equal(exactSignatures.size, 147, 'expected 147 unique full-item signatures');
assert.equal(shortPassageIds.length, 0, `R&W passages under 45 words:\n${shortPassageIds.join(', ')}`);
assert.equal(forbiddenRwLabels.length, 0, `R&W stimuli must not expose practice/QA source labels:\n${forbiddenRwLabels.join('\n')}`);
assert.equal(genericRwPrompts.length, 0, `R&W prompts must be passage-specific rather than generic placeholders:\n${genericRwPrompts.join('\n')}`);
assert.equal(terseRwPrompts.length, 0, `R&W prompts are too terse to be reliable assessment stems:\n${terseRwPrompts.join('\n')}`);

console.log(`Audited ${exactSignatures.size} unique items with complete R&W passages.`);
console.log('No R&W short, synthetic, or practice-labelled stimuli remain.');
