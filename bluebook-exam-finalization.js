(() => {
  'use strict';

  let recoveryCountdown = null;

  const getState = () => window.AZAMAN_APP?.getState?.();
  const save = () => window.AZAMAN_APP?.save?.();

  function isActualRuntime() {
    const state = getState();
    return !!state && !state.harness;
  }

  function recoveryIsValid(recovery) {
    return Number.isFinite(recovery?.remainingMs) && recovery.remainingMs > 0 && Number.isFinite(recovery?.expiresAt) && Date.now() < recovery.expiresAt;
  }

  function submissionRetryIsValid(state) {
    return Number.isFinite(state?.submissionRetryExpiresAt) && Date.now() < state.submissionRetryExpiresAt;
  }

  function nextDaySubmissionDeadline(now = Date.now()) {
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(23, 59, 59, 999);
    return deadline.getTime();
  }

  function clearRecoveryCountdown() {
    if (recoveryCountdown) window.clearInterval(recoveryCountdown);
    recoveryCountdown = null;
  }

  function expireRecovery() {
    const state = getState();
    if (!state?.recovery || recoveryIsValid(state.recovery)) return false;
    clearRecoveryCountdown();
    state.recovery = null;
    state.screen = 'access';
    state.endAt = null;
    save();
    window.AZAMAN_APP?.render?.();
    return true;
  }

  function mountRecoveryNotice() {
    const state = getState();
    if (!isActualRuntime() || state.screen !== 'signin' || !state.recovery || document.getElementById('azmRecoveryNotice')) return;
    if (!recoveryIsValid(state.recovery)) { expireRecovery(); return; }
    const page = document.querySelector('.access-page');
    if (!page) return;
    const notice = document.createElement('div');
    notice.id = 'azmRecoveryNotice';
    notice.className = 'azm-recovery-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML = '<strong>Testing was interrupted.</strong><span>Your answers are saved on this device. Sign in again to continue testing.</span><span id="azmRecoveryCountdown" class="azm-recovery-countdown"></span>';
    page.insertBefore(notice, page.firstChild);
    const update = () => {
      const current = getState();
      if (!current?.recovery) { clearRecoveryCountdown(); return; }
      const left = Math.max(0, current.recovery.expiresAt - Date.now());
      const mins = Math.ceil(left / 60000);
      const countdown = document.getElementById('azmRecoveryCountdown');
      if (countdown) countdown.textContent = `Recovery window: about ${mins} min remaining.`;
      if (left <= 0) expireRecovery();
    };
    clearRecoveryCountdown();
    update();
    recoveryCountdown = window.setInterval(update, 1000);
  }

  function resumeFromRecovery(event) {
    const state = getState();
    const button = event.target?.closest?.('#signinBtn');
    if (!state || !state.recovery || state.screen !== 'signin' || !button || !isActualRuntime()) return;
    if (!recoveryIsValid(state.recovery)) { event.preventDefault(); event.stopImmediatePropagation(); expireRecovery(); return; }
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    if (!email?.value.trim() || !password?.value.trim()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    state.student = document.getElementById('student')?.value.trim() || state.student || 'Student';
    state.email = email.value.trim();
    state.password = '';
    state.endAt = Date.now() + state.recovery.remainingMs;
    state.recovery = null;
    state.screen = 'test';
    clearRecoveryCountdown();
    save();
    window.AZAMAN_APP?.render?.();
  }

  function laptopArt() {
    return `<svg viewBox="0 0 220 180" class="azm-congrats-laptop" aria-hidden="true">
      <circle cx="110" cy="82" r="55" fill="#eef5fc" stroke="#dbe7f4" stroke-width="2"/>
      <rect x="54" y="38" width="112" height="82" rx="8" fill="#fff" stroke="#59616a" stroke-width="4"/>
      <rect x="65" y="49" width="90" height="58" fill="#fff" stroke="#59616a" stroke-width="3"/>
      <circle cx="110" cy="78" r="17" fill="#8fd4f5" stroke="#59616a" stroke-width="2.5"/>
      <path d="M100 74q3-5 6 0M114 74q3-5 6 0" fill="none" stroke="#59616a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M99 84q11 10 22 0" fill="none" stroke="#59616a" stroke-width="3" stroke-linecap="round"/>
      <path d="M48 122h124l13 13H35z" fill="#d9e0e7" stroke="#59616a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M56 127h108" stroke="#9da5ad" stroke-width="2"/>
    </svg>`;
  }

  function confettiMarkup() {
    const pieces = [];
    const palette = ['pink', 'yellow', 'blue', 'pink', 'blue', 'yellow', 'teal'];
    const positions = [
      [2, 9], [7, 31], [12, 17], [17, 44], [22, 7], [27, 24], [33, 13], [38, 37],
      [44, 5], [50, 28], [56, 14], [62, 35], [67, 10], [72, 43], [78, 21], [84, 8],
      [90, 33], [96, 17], [4, 58], [11, 72], [19, 63], [26, 82], [34, 68], [42, 91],
      [49, 60], [57, 78], [64, 55], [71, 88], [79, 66], [87, 81], [94, 61], [98, 94],
      [15, 95], [29, 53], [47, 71], [61, 96], [75, 57], [88, 70], [3, 87], [54, 44],
      [23, 32], [36, 79], [69, 30], [81, 47], [92, 52], [58, 19], [9, 48], [43, 17],
      [73, 6], [31, 5], [65, 73], [85, 13]
    ];
    positions.forEach(([x, y], i) => {
      const delay = ((i % 9) * -0.78).toFixed(2);
      const duration = (5.8 + (i % 6) * 0.72).toFixed(2);
      const rotate = -26 + ((i * 19) % 52);
      const drift = -34 + ((i * 13) % 69);
      const width = 4 + (i % 3);
      const height = 10 + (i % 5);
      pieces.push(`<span class="azm-confetti-piece ${palette[i % palette.length]}" style="--x:${x}%;--y:${y}%;--delay:${delay}s;--duration:${duration}s;--rotate:${rotate}deg;--drift:${drift}px;width:${width}px;height:${height}px"></span>`);
    });
    return pieces.join('');
  }

  function submissionPending(state) {
    return state.submissionPending === true && submissionRetryIsValid(state);
  }

  function markOfflineSubmissionPending(state) {
    if (!state || state.screen !== 'finish' || state.submissionPending === true || state.submissionRetryExpired === true || navigator.onLine !== false) return false;
    state.submissionPending = true;
    state.submissionRetryExpiresAt = nextDaySubmissionDeadline();
    state.submissionAttemptedAt = Date.now();
    state.submitted = false;
    save();
    return true;
  }

  function expireSubmissionRetry() {
    const state = getState();
    if (!state?.submissionPending || submissionRetryIsValid(state)) return false;
    state.submissionPending = false;
    state.submissionRetryExpired = true;
    save();
    return true;
  }

  function retrySubmission() {
    const state = getState();
    if (!state || !isActualRuntime() || state.screen !== 'finish' || !submissionPending(state)) return;
    if (navigator.onLine === false) return;
    state.submissionPending = false;
    state.submissionRetryExpired = false;
    state.submissionRetryExpiresAt = null;
    state.submissionAttemptedAt = Date.now();
    state.submitted = true;
    save();
    window.AZAMAN_APP?.render?.();
  }

  function mountSubmissionScreen() {
    const state = getState();
    if (!isActualRuntime() || state.screen !== 'finish' || document.getElementById('azmSubmissionScreen')) return;
    const app = document.getElementById('app');
    if (!app) return;
    const pending = submissionPending(state);
    const expired = state.submissionRetryExpired === true;
    const statusCopy = pending
      ? 'Your answers are saved on this device, but they have not been submitted yet.'
      : expired
        ? 'Your answers are saved on this device, but the submission window has ended.'
        : 'The test is complete, and your answers have been submitted.';
    const detailCopy = pending
      ? 'Reconnect to the internet and submit your answers before 11:59 p.m. local time the day after your test.'
      : expired
        ? 'Contact your testing coordinator for next steps.'
        : 'Your proctor will dismiss you when it’s time to go.';
    app.innerHTML = `<main id="azmSubmissionScreen" class="azm-submission-page azm-congrats-page"><div class="azm-confetti-layer" aria-hidden="true">${confettiMarkup()}</div><section class="azm-congrats-card" role="status" aria-live="polite" aria-atomic="true"><h1>Congratulations!</h1><p class="azm-congrats-sub">${statusCopy}</p><div class="azm-congrats-panel"><div class="azm-congrats-art">${laptopArt()}</div><div class="azm-congrats-copy"><p>${detailCopy}</p><p>${pending ? 'Your answers remain saved on this device until you submit them.' : expired ? 'The test record remains on this device for reference.' : 'Please <strong>be quiet</strong>; other students may still be testing.'}</p></div></div>${pending ? '<div class="modal-actions"><button type="button" id="azmRetrySubmission" class="btn primary-action">Submit Again</button></div>' : ''}<button type="button" id="azmReturnHome" class="azm-congrats-home">Return to Homepage</button></section></main>`;
    document.getElementById('azmRetrySubmission')?.addEventListener('click', retrySubmission);
    document.getElementById('azmReturnHome')?.addEventListener('click', () => { try { localStorage.removeItem('azaman-sat-practice-v3'); } catch (_) {} location.reload(); });
  }

  function maintain() {
    if (!isActualRuntime()) { clearRecoveryCountdown(); return; }
    if (getState()?.recovery) { mountRecoveryNotice(); return; }
    const state = getState();
    if (state?.screen === 'finish' && !state.submissionPending && !state.submissionAttemptedAt && navigator.onLine === false) {
      markOfflineSubmissionPending(state);
    }
    if (state?.submissionPending && !submissionRetryIsValid(state)) {
      expireSubmissionRetry();
    }
    clearRecoveryCountdown();
    mountSubmissionScreen();
  }

  function installRenderHook() {
    const api = window.AZAMAN_APP;
    if (!api?.render || api.render.__azmExamFinalizationWrapped) return;
    const originalRender = api.render;
    const wrappedRender = function wrappedRender(...args) { const result = originalRender.apply(this, args); queueMicrotask(maintain); return result; };
    Object.defineProperty(wrappedRender, '__azmExamFinalizationWrapped', { value: true });
    api.render = wrappedRender;
  }

  document.addEventListener('click', resumeFromRecovery, true);
  installRenderHook();
  maintain();
})();
