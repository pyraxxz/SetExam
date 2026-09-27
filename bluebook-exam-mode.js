(() => {
  'use strict';

  const getState = () => window.AZAMAN_APP?.getState?.();
  const save = () => window.AZAMAN_APP?.save?.();
  const render = () => window.AZAMAN_APP?.render?.();

  function syncModeClass() {
    const state = getState();
    document.body.classList.toggle('azm-harness', !!state?.harness);
  }

  function actualModeExamHeader() {
    const state = getState();
    const title = document.querySelector('.test-top .test-title');
    if (!state || state.harness || state.screen !== 'test' || !title) return;
    const index = Math.max(0, Math.min(3, Number(state.mi) || 0));
    const section = index < 2 ? '1' : '2';
    const name = index < 2 ? 'Reading and Writing' : 'Math';
    const text = `Section ${section}: ${name}`;
    if (title.textContent.trim() !== text) title.textContent = text;
  }

  function scoreRatio(items, state, id) {
    if (!Array.isArray(items) || !items.length) return 0;
    let good = 0;
    for (let i = 0; i < items.length; i += 1) {
      const value = state.answers?.[`${id}-${i}`];
      const expected = items[i]?.answer;
      if (value !== undefined && String(value).trim().toLowerCase() === String(expected ?? '').trim().toLowerCase()) good += 1;
    }
    return good / items.length;
  }

  function completeCurrentModule(state) {
    const index = Math.max(0, Math.min(3, Number(state.mi) || 0));
    const moduleId = index === 0 ? 'rw1' : index === 1 ? 'rw2' : index === 2 ? 'math1' : 'math2';
    state.completed = state.completed || {};
    state.completed[moduleId] = true;
    state.endAt = null;

    if (moduleId === 'rw1') {
      const bank = window.SAT_QUESTIONS?.rw1 || [];
      state.adaptive = state.adaptive || { rw: 'easy', math: 'easy' };
      state.adaptive.rw = scoreRatio(bank, state, moduleId) >= 0.7 ? 'hard' : 'easy';
      state.mi = 1;
      state.qi = 0;
      state.screen = 'directions';
    } else if (moduleId === 'rw2') {
      state.mi = 2;
      state.qi = 0;
      state.breakEndAt = Date.now() + 600 * 1000;
      state.screen = 'break';
    } else if (moduleId === 'math1') {
      const bank = window.SAT_QUESTIONS?.math1 || [];
      state.adaptive = state.adaptive || { rw: 'easy', math: 'easy' };
      state.adaptive.math = scoreRatio(bank, state, moduleId) >= 0.7 ? 'hard' : 'easy';
      state.mi = 3;
      state.qi = 0;
      state.screen = 'directions';
    } else {
      state.submitted = true;
      state.screen = 'finish';
    }
    save();
    render();
  }

  function expireActualDirectionsModule() {
    const state = getState();
    if (!state || state.harness || state.screen !== 'directions') return;
    completeCurrentModule(state);
    save();
    render();
  }


  function actualModeDirections() {
    const state = getState();
    const page = document.getElementById('azmDirectionsPage');
    const panel = page?.querySelector('.azm-directions-panel');
    if (!state || state.harness || state.screen !== 'directions' || !page || !panel) return;
    const index = Math.max(0, Math.min(3, Number(state.mi) || 0));
    const section = index < 2 ? '1' : '2';
    const module = (index % 2) + 1;
    const name = index < 2 ? 'Reading and Writing' : 'Math';
    const heading = panel.querySelector('h2');
    if (heading) heading.textContent = `Section ${section}, Module ${module}: ${name}`;
    const bullets = [
      index >= 2 ? 'This module is made up of multiple-choice questions and student-produced response questions.' : 'This module is made up of multiple-choice questions.',
      'You can move back and forth between questions until time expires.',
      'At the end of the module, you can review your answers until time expires.',
      'Once the next module begins, you cannot return to these questions.'
    ];
    const list = panel.querySelector('ul');
    if (list) {
      const html = bullets.map((text) => `<li>${text}</li>`).join('');
      if (list.innerHTML !== html) list.innerHTML = html;
    }
    panel.querySelector('.azm-official-directions-copy')?.remove();
  }

  function actualModeDirectionsContinue(event) {
    const state = getState();
    const button = event.target?.closest?.('#beginModuleBtn');
    if (!state || state.harness || !button || state.screen !== 'directions') return;
    if (state.endAt && state.endAt <= Date.now()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      expireActualDirectionsModule();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    const minutes = state.mi >= 2 ? 35 : 32;
    state.endAt = Date.now() + minutes * 60 * 1000;
    state.qi = 0;
    state.timerHidden = false;
    state.lineReader = false;
    state.screen = 'test';
    save();
    render();
  }

  function actualModeReviewCopy() {
    const state = getState();
    if (!state || state.harness) return;
    const modal = document.getElementById('reviewModal');
    const copy = modal?.querySelector('.modal > p.small');
    const text = 'You can return to any question in this module. The module ends automatically when time expires.';
    if (copy && copy.textContent !== text) copy.textContent = text;
  }

  function actualModeAdvanceGuard(event) {
    const state = getState();
    const button = event.target?.closest?.('#nextBtn');
    if (!state || state.harness || !button || state.screen !== 'test') return;
    if (!/Review module/i.test(button.textContent || '')) return;
    if (!state.endAt || state.endAt <= Date.now()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showBlockedMessage();
  }

  function showBlockedMessage() {
    if (document.getElementById('azmExamGate')) return;
    const n = document.createElement('div');
    n.id = 'azmExamGate';
    n.className = 'azm-exam-gate';
    n.innerHTML = '<div class="azm-exam-gate-inner" role="status" aria-live="polite"><strong>This module is not over yet.</strong><span>You cannot move to the next module until the timer expires.</span></div>';
    document.body.appendChild(n);
    window.setTimeout(() => n.remove(), 2200);
  }

  function afterRender() {
    syncModeClass();
    actualModeExamHeader();
    actualModeDirections();
    actualModeReviewCopy();
  }

  function installRenderHook() {
    const api = window.AZAMAN_APP;
    if (!api?.render || api.render.__azmExamModeWrapped) return;
    const originalRender = api.render;
    const wrappedRender = function wrappedRender(...args) {
      const result = originalRender.apply(this, args);
      queueMicrotask(afterRender);
      return result;
    };
    Object.defineProperty(wrappedRender, '__azmExamModeWrapped', { value: true });
    api.render = wrappedRender;
  }

  document.addEventListener('click', actualModeDirectionsContinue, true);
  document.addEventListener('click', actualModeAdvanceGuard, true);
  installRenderHook();
  afterRender();
})();