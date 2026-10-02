const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('session-guard.js', 'utf8');
const NOW = 1_000_000;

function run(initial, bank = {}) {
  let raw = JSON.stringify(initial);
  const sandbox = {
    Date: { now: () => NOW }, JSON, Math, String, Number, Array, Object, Set,
    window: { SAT_QUESTIONS: bank },
    localStorage: { getItem: () => raw, setItem: (_, value) => { raw = value; } }
  };
  sandbox.window.localStorage = sandbox.localStorage;
  vm.runInNewContext(source, sandbox);
  return JSON.parse(raw);
}

function base() {
  return {
    v: 3, screen: 'test', mi: 0, qi: 4, endAt: NOW + 60_000, breakEndAt: null,
    submitted: false, completed: {}, answers: {}, marked: {}, eliminated: {}, notes: {},
    highlights: {}, warning: {}, adaptive: { rw: 'easy', math: 'easy' }
  };
}

let state = run({ ...base(), screen: 'signin', mi: 2, qi: 7, endAt: null,
  completed: { rw1: true, rw2: true, math1: false, math2: false },
  answers: { 'math1-7': 'B' },
  recovery: { remainingMs: 241_000, expiresAt: NOW + 600_000 }
});
assert.equal(state.screen, 'signin');
assert.equal(state.mi, 2);
assert.equal(state.qi, 7);
assert.equal(state.endAt, null);
assert.deepEqual(state.recovery, { remainingMs: 241_000, expiresAt: NOW + 600_000 });
assert.equal(state.answers['math1-7'], 'B');

state = run({ ...base(), screen: 'signin', mi: 2, qi: 7, endAt: null,
  completed: { rw1: true, rw2: true, math1: false, math2: false },
  recovery: { remainingMs: 241_000, expiresAt: NOW - 1 }
});
assert.equal(state.recovery, null);
assert.equal(state.screen, 'signin');
assert.equal(state.mi, 2);

state = run({ ...base(), screen: 'signin', mi: 2, qi: 999, endAt: null,
  completed: { rw1: true, rw2: true, math1: false, math2: false },
  recovery: { remainingMs: 241_000, expiresAt: NOW + 600_000 }
});
assert.equal(state.screen, 'signin');
assert.equal(state.mi, 2);
assert.equal(state.qi, 21);

state = run({ ...base(), screen: 'checkin' });
assert.equal(state.screen, 'checkin');
assert.equal(state.mi, 0);
assert.equal(state.qi, 4);

state = run({ ...base(), submitted: true, screen: 'test', mi: 0, completed: { rw1: true, rw2: true, math1: true, math2: true } });
assert.equal(state.screen, 'finish');
assert.equal(state.endAt, null);
assert.equal(state.breakEndAt, null);

state = run({ ...base(), submitted: true, screen: 'finish', mi: 3, completed: { rw1: true } });
assert.equal(state.submitted, false);
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);
assert.equal(state.endAt, null);
assert.equal(state.breakEndAt, null);

state = run({ ...base(), completed: { rw1: true } });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);

state = run({ ...base(), screen: 'directions', completed: { rw1: true }, mi: 0 });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);

state = run({ ...base(), screen: 'directions', completed: { rw1: true, rw2: true }, mi: 1 });
assert.equal(state.screen, 'break');
assert.equal(state.mi, 2);
assert.ok(state.breakEndAt > NOW);

state = run({ ...base(), screen: 'directions', completed: { rw1: true, rw2: true, math1: true }, mi: 2 });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 3);
assert.equal(state.qi, 0);

state = run({ ...base(), screen: 'access', completed: { rw1: true }, mi: 0 });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);
assert.equal(state.endAt, null);

state = run({ ...base(), screen: 'setup', completed: { rw1: true, rw2: true }, mi: 1 });
assert.equal(state.screen, 'break');
assert.equal(state.mi, 2);
assert.ok(state.breakEndAt > NOW);

state = run({ ...base(), screen: 'room', completed: { rw1: true, rw2: true, math1: true }, mi: 2 });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 3);
assert.equal(state.qi, 0);

state = run({ ...base(), mi: 2, endAt: null });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 0);
assert.equal(state.qi, 0);
assert.equal(state.endAt, null);

state = run({ ...base(), screen: 'break', mi: 1, breakEndAt: NOW - 1 });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 0);
assert.equal(state.breakEndAt, null);

state = run({ ...base(), screen: 'break', mi: 1, breakEndAt: NOW - 1, completed: { rw1: true, rw2: true } });
assert.equal(state.screen, 'break');
assert.equal(state.mi, 2);
assert.equal(state.breakEndAt, null);
assert.equal(state.endAt, null);
assert.equal(state.completed.rw1, true);
assert.equal(state.completed.rw2, true);
assert.equal(state.completed.math1, false);
assert.equal(state.completed.math2, false);

state = run({ ...base(), mi: 0, qi: 500, endAt: NOW - 1 }, {
  rw1: Array.from({ length: 27 }, (_, i) => ({ answer: i === 0 ? 'A' : 'B' }))
});
assert.equal(state.completed.rw1, true);
assert.equal(state.mi, 1);
assert.equal(state.screen, 'directions');
assert.equal(state.adaptive.rw, 'easy');

state = run({ ...base(), mi: 0, endAt: NOW - 1, answers: { 'rw1-0': 'A' } }, {
  rw1: Array.from({ length: 27 }, (_, i) => ({ answer: i === 0 ? 'A' : 'B' }))
});
assert.equal(state.adaptive.rw, 'easy');

state = run({ ...base(), mi: 0, endAt: NOW - 1, answers: { 'rw1-0': '7/2' } }, {
  rw1: Array.from({ length: 27 }, (_, i) => ({ answer: i === 0 ? '3.5' : 'B' }))
});
assert.equal(state.adaptive.rw, 'easy');

state = run({ ...base(), mi: 3, endAt: NOW - 1, completed: { rw1: true, rw2: true, math1: true } });
assert.equal(state.completed.math2, true);
assert.equal(state.submitted, true);
assert.equal(state.screen, 'finish');

state = run({ ...base(), screen: 'test', endAt: null });
assert.equal(state.screen, 'directions');

state = run({ ...base(), screen: 'not-a-real-screen', mi: 99, qi: -4, completed: { rw1: 'false', math2: 1 }, marked: ['rw1-1'], warning: { rw1: 'true' }, timerHidden: 'yes', rules: 1 });
assert.equal(state.screen, 'access');
assert.equal(state.mi, 0);
assert.equal(state.qi, 0);
assert.deepEqual(state.completed, { rw2: false, math1: false, math2: false });
assert.deepEqual(state.marked, {});
assert.deepEqual(state.warning, {});
assert.equal(state.timerHidden, false);
assert.equal(state.rules, false);

state = run({ ...base(), submitted: false, screen: 'break', mi: 0, breakEndAt: NOW + 10_000, completed: { rw1: true, rw2: true }, adaptive: { rw: 'garbage', math: 'hard' } });
assert.equal(state.screen, 'break');
assert.equal(state.mi, 2);
assert.equal(state.adaptive.rw, 'easy');
assert.equal(state.adaptive.math, 'hard');
assert.ok(state.breakEndAt > NOW);

state = run({ ...base(), screen: 'break', mi: 0, breakEndAt: NOW + 10_000, completed: {} });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 0);
assert.equal(state.qi, 0);
assert.equal(state.breakEndAt, null);

state = run({ ...base(), screen: 'break', mi: 1, breakEndAt: NOW + 10_000, completed: { rw1: true } });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);
assert.equal(state.breakEndAt, null);

state = run({ ...base(), screen: 'break', mi: 2, breakEndAt: NOW + 10_000, completed: { rw1: true, rw2: true, math1: true, math2: true } });
assert.equal(state.screen, 'finish');
assert.equal(state.submitted, true);
assert.equal(state.mi, 3);
assert.equal(state.qi, 0);
assert.equal(state.breakEndAt, null);
assert.equal(state.completed.rw1, true);
assert.equal(state.completed.rw2, true);
assert.equal(state.completed.math1, true);
assert.equal(state.completed.math2, true);

state = run({ ...base(), screen: 'directions', mi: 3, completed: { rw1: true, rw2: true, math1: true, math2: true } });
assert.equal(state.screen, 'finish');
assert.equal(state.submitted, true);
assert.equal(state.mi, 3);
assert.equal(state.qi, 0);

state = run({ ...base(), screen: 'directions', mi: 1, completed: { rw1: true, math1: true, math2: true } });
assert.equal(state.completed.rw1, true);
assert.notEqual(state.completed.rw2, true);
assert.notEqual(state.completed.math1, true);
assert.notEqual(state.completed.math2, true);
assert.equal(state.mi, 1);
assert.equal(state.screen, 'directions');

state = run({ ...base(), screen: 'test', mi: 1, completed: { rw1: true, rw2: true, math2: true }, endAt: NOW + 60_000 });
assert.equal(state.completed.rw1, true);
assert.equal(state.completed.rw2, true);
assert.notEqual(state.completed.math1, true);
assert.notEqual(state.completed.math2, true);
assert.equal(state.screen, 'break');
assert.equal(state.mi, 2);

state = run({ ...base(), screen: 'test', mi: 2, endAt: NOW + 60_000, completed: { rw1: true } });
assert.equal(state.completed.rw1, true);
assert.notEqual(state.completed.rw2, true);
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 1);
assert.equal(state.qi, 0);
assert.equal(state.endAt, null);

state = run({
  ...base(),
  screen: 'test',
  endAt: 'not-a-time',
  breakEndAt: 'also-invalid',
  answers: { 'rw1-0': 123, bad: null },
  marked: ['rw1-0'],
  eliminated: { 'rw1-0': [0, 0, 1, 4, -1, '2'] },
  notes: { 'rw1-0': 'valid', bad: 42 },
  highlights: { 'rw1-0': [' passage ', '', ' passage ', 7] }
});
assert.equal(state.endAt, null);
assert.equal(state.breakEndAt, null);
assert.deepEqual(state.answers, { 'rw1-0': '123' });
assert.deepEqual(state.marked, {});
assert.deepEqual(state.eliminated, { 'rw1-0': [0, 1] });
assert.deepEqual(state.notes, { 'rw1-0': 'valid' });
assert.deepEqual(state.highlights, { 'rw1-0': [' passage '] });
assert.equal(state.screen, 'directions');
assert.equal(state.mi, 0);
assert.equal(state.qi, 0);

state = run({ ...base(), screen: 'break', mi: 2, breakEndAt: NOW + 10_000, completed: { rw1: true, rw2: true }, eliminated: { 'math1-0': [0, 4, 0, 2] }, highlights: { 'math1-0': ['note', 'note'] } });
assert.equal(state.screen, 'break');
assert.deepEqual(state.eliminated, { 'math1-0': [0, 2] });
assert.deepEqual(state.highlights, { 'math1-0': ['note'] });

console.log('Session recovery guard tests passed.');