(() => {
  'use strict';

  const getState = () => window.AZAMAN_APP?.getState?.();
  const save = () => window.AZAMAN_APP?.save?.();
  const render = () => window.AZAMAN_APP?.render?.();
  let wasBreak = false;
  let readyShown = false;

  function actual() {
    const state = getState();
    return !!state && !state.harness;
  }

  function mountBreak() {
    const state = getState();
    if (!actual() || state.screen !== 'break' || document.querySelector('.azm-module-transition')) return;
    const app = document.getElementById('app');
    if (!app || document.getElementById('azmBreakPage')) return;

    wasBreak = true;
    const remaining = state.breakEndAt ? Math.max(0, Math.ceil((state.breakEndAt - Date.now()) / 1000)) : 0;
    readyShown = !state.breakEndAt || remaining <= 0;
    app.innerHTML = `<main id="azmBreakPage" class="azm-break-page" aria-labelledby="azmBreakTitle">
      <div class="azm-break-device-status" aria-label="Battery status"><span class="azm-break-battery" id="azmBreakBattery">85% ▰</span></div>
      <section class="azm-break-timer" aria-label="Remaining Break Time">
        <div class="azm-break-label">Remaining Break Time:</div>
        <div id="breakClock" class="azm-break-clock">${fmt(remaining)}</div>
      </section>
      <section class="azm-break-content">
        <h1 id="azmBreakTitle">Take a Break: Do Not Close Your Device</h1>
        <p class="lead">After the break, a Resume Testing Now button will appear and you'll start the next section.</p>
        <h2>Follow these rules during the break:</h2>
        <ol>
          <li>Do not disturb students who are still testing.</li>
          <li>Do not exit the app or close your laptop.</li>
          <li>Do not access phones, smartwatches, textbooks, notes, or the internet.</li>
          <li>Do not eat or drink near any testing device.</li>
          <li>Do not speak in the test room; outside the test room, do not discuss the exam with anyone.</li>
        </ol>
        <div class="azm-break-ready" ${readyShown ? '' : 'hidden'}>
          <button id="azmResumeBtn" class="btn">Resume Testing Now</button>
        </div>
      </section>
      <div class="azm-break-footer">${escapeHtml(state.student || 'Student')}</div>
    </main>`;
    bindResume();
    refreshBattery();
  }

  function refreshBattery() {
    const node = document.getElementById('azmBreakBattery');
    if (!node || !navigator.getBattery) return;
    navigator.getBattery().then((battery) => {
      const draw = () => { node.textContent = String(Math.round(battery.level * 100)) + '% ▰'; };
      draw();
      battery.addEventListener('levelchange', draw);
    }).catch(() => {});
  }
  function fmt(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function bindResume() {
    const btn = document.getElementById('azmResumeBtn');
    if (btn) btn.focus();
  }

  function delegateResume() {
    if (delegateResume.bound) return;
    delegateResume.bound = true;
    document.addEventListener('click', (event) => {
      if (!event.target?.closest?.('#azmResumeBtn')) return;
      const current = getState();
      if (!current || current.harness || current.screen !== 'break') return;
      current.mi = 2;
      current.qi = 0;
      current.breakEndAt = null;
      current.endAt = null;
      current.screen = 'directions';
      save();
      wasBreak = false;
      readyShown = false;
      render();
    }, true);
  }

  function maintain() {
    if (!actual()) return;
    const state = getState();
    if (!state) return;

    if (wasBreak && state.screen === 'directions' && state.mi === 2 && state.completed?.rw2 && !state.breakEndAt) {
      state.screen = 'break';
      save();
      readyShown = true;
      render();
      return;
    }

    if (state.screen !== 'break') {
      wasBreak = false;
      readyShown = false;
      return;
    }

    wasBreak = true;
    mountBreak();

    const page = document.getElementById('azmBreakPage');
    if (!page) return;
    const clock = document.getElementById('breakClock');
    const left = state.breakEndAt ? Math.max(0, Math.ceil((state.breakEndAt - Date.now()) / 1000)) : 0;
    const text = fmt(left);
    if (clock && clock.textContent !== text) clock.textContent = text;

    if (left <= 0 && !readyShown) {
      readyShown = true;
      if (state.breakEndAt) {
        state.breakEndAt = null;
        save();
      }
      const ready = page.querySelector('.azm-break-ready');
      if (ready && ready.hidden) ready.hidden = false;
      bindResume();
    }
  }

  delegateResume();

  const observer = new MutationObserver(maintain);
  observer.observe(document.body, { childList: true, subtree: true });
  window.setInterval(maintain, 250);
  maintain();
})();
