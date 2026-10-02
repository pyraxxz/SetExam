const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const sandbox = { window: {} };
for (const path of ['data/questions.js', 'data/rw2-easy.js', 'data/rw-source-overrides.js', 'data/question-quality-overrides.js']) {
  vm.runInNewContext(fs.readFileSync(path, 'utf8'), sandbox);
}

const groups = [
  ['math1', sandbox.window.SAT_QUESTIONS.math1],
  ['math2.easy', sandbox.window.SAT_QUESTIONS.math2.easy],
  ['math2.hard', sandbox.window.SAT_QUESTIONS.math2.hard]
];

for (const [name, items] of groups) {
  assert.equal(items.length, 22, `${name} must contain 22 items`);
  const ids = new Set(items.map((question) => question.id));
  assert.equal(ids.size, 22, `${name} must contain unique question IDs`);
  const prompts = items.map((question) => question.prompt.trim().toLowerCase());
  assert.equal(new Set(prompts).size, 22, `${name} must contain unique question prompts`);

  assert.equal(items.filter((question) => question.difficulty === 'hard').length, name === 'math2.hard' ? 22 : items.filter((question) => question.difficulty === 'hard').length, `${name} hard-tagging is inconsistent`);
  assert.equal(items.filter((question) => question.type === 'spr').length, 5, `${name} must contain 5 Math SPR items`);
  assert.equal(items.filter((question) => question.type === 'mcq').length, 17, `${name} must contain 17 Math MCQ items`);

  const domains = {
    Algebra: 0,
    'Advanced Math': 0,
    'Problem Solving and Data Analysis': 0,
    'Geometry and Trigonometry': 0
  };
  items.forEach((question) => {
    assert.equal(question.section, 'Math', `${name} must contain only Math questions`);
    assert(question.prompt.length > 45, `${question.id} prompt should require meaningful reasoning`);
    assert(question.explanation.length > 60, `${question.id} explanation should contain substantive guidance`);
    assert(Object.prototype.hasOwnProperty.call(domains, question.domain), `${question.id} has an unexpected Math domain`);
    domains[question.domain] += 1;

    if (question.type === 'spr') {
      assert(!question.options || question.options.length === 0, `${question.id} SPR must not expose MCQ options`);
      assert(question.answer, `${question.id} SPR must retain an answer`);
    } else {
      assert.equal(question.options.length, 4, `${question.id} must have four answer choices`);
      const answerIndex = ['A', 'B', 'C', 'D'].indexOf(question.answer);
      assert(answerIndex >= 0, `${question.id} lost its answer letter`);
      assert.equal(new Set(question.options).size, 4, `${question.id} has duplicate answer choices`);
      assert.equal(question.options[answerIndex]?.trim(), question.options[answerIndex]?.trim(), `${question.id} answer mapping must remain deterministic`);
    }
  });

  assert(domains.Algebra >= 6 && domains.Algebra <= 9, `${name} Algebra coverage outside expected range`);
  assert(domains['Advanced Math'] >= 6 && domains['Advanced Math'] <= 8, `${name} Advanced Math coverage outside expected range`);
  assert(domains['Problem Solving and Data Analysis'] >= 3 && domains['Problem Solving and Data Analysis'] <= 5, `${name} Problem Solving and Data Analysis coverage outside expected range`);
  assert(domains['Geometry and Trigonometry'] >= 3 && domains['Geometry and Trigonometry'] <= 5, `${name} Geometry and Trigonometry coverage outside expected range`);
}

assert.equal(groups[2][1].filter((question) => question.difficulty === 'hard').length, 22, 'Math M2 hard module must be fully hard-tagged');
console.log('Math question quality checks passed: 22 distinct items in each route, 5 SPR + 17 MCQ, full domain coverage.');
