(() => {
  'use strict';

  const state = () => window.AZAMAN_APP?.getState?.();
  const save = () => window.AZAMAN_APP?.save?.();
  const render = () => window.AZAMAN_APP?.render?.();

  function isTest() {
    return !!document.querySelector('.test-shell');
  }

  function addDeviceTestButton() {
    const onAccess = !!document.querySelector('.access-page');
    const existing = document.getElementById('deviceTestBtn');
    if (existing && !onAccess) { existing.remove(); return; }
    if (!onAccess || existing) return;
    const button = document.createElement('button');
    button.id = 'deviceTestBtn';
    button.type = 'button';
    button.textContent = 'Test Your Device';
    button.addEventListener('click', openDeviceTest);
    document.body.appendChild(button);
  }

  function closeDialog(id) {
    document.getElementById(id)?.remove();
  }

  function openDeviceTest() {
    closeDialog('deviceTestDialog');
    const checks = [
      ['Browser', !!window.localStorage],
      ['Screen size', window.innerWidth >= 800 && window.innerHeight >= 500],
      ['JavaScript', true],
      ['Touch input', navigator.maxTouchPoints > 0],
    ];
    const dialog = document.createElement('div');
    dialog.id = 'deviceTestDialog';
    dialog.className = 'modal-backdrop';
    dialog.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="deviceTestTitle"><div class="modal-head"><h3 id="deviceTestTitle">Test Your Device</h3><button class="icon-btn" id="closeDeviceTest" aria-label="Close">×</button></div><p>Run a quick local readiness check before starting your exam.</p><div class="device-check-list">${checks.map(([name, ok]) => `<div class="device-check-row"><span>${name}</span><strong class="${ok ? 'ok' : 'warn'}">${ok ? 'Ready' : 'Check'}</strong></div>`).join('')}</div><p class="small">This practice simulator performs these checks locally and does not contact a test service.</p><div class="modal-actions"><button class="btn primary-action" id="deviceTestDone">Done</button></div></div>`;
    document.body.appendChild(dialog);
    const close = () => dialog.remove();
    dialog.querySelector('#closeDeviceTest').onclick = close;
    dialog.querySelector('#deviceTestDone').onclick = close;
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.querySelector('#deviceTestDone').focus();
  }

  function normalizeStudentLogin() {
    const app = state();
    if (!app || app.screen !== 'signin') return;
    if (!app.student) {
      app.student = 'Student';
      save();
    }

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const button = document.getElementById('signinBtn');
    const student = document.getElementById('student');
    if (!email || !password || !button) return;

    // Bluebook's student-account surface asks for email/password. The core
    // state engine keeps a student field for existing smoke compatibility,
    // but the field is intentionally hidden from the student-facing surface.
    const studentField = student?.closest('.field');
    if (studentField) studentField.style.display = 'none';
    if (student) student.setAttribute('aria-hidden', 'true');
    if (button.textContent !== 'Sign In') button.textContent = 'Sign In';

    const sync = () => {
      button.disabled = !(email.value.trim() && password.value.trim());
      if (student && !student.value.trim()) {
        const local = email.value.trim().split('@')[0].replace(/[._-]+/g, ' ').trim();
        if (local) {
          student.value = local;
          student.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };
    if (email.dataset.refLoginReady !== '1') {
      email.dataset.refLoginReady = '1';
      email.addEventListener('input', sync, { passive: true });
      password.addEventListener('input', sync, { passive: true });
    }
    sync();
  }

  function hideDashboardExtras() {
    // Keep current Bluebook dashboard data visible; app.js owns the current test-card content.
  }

  function addExitItem() {
    if (!isTest()) return;
    const menu = document.getElementById('toolPopover');
    if (!menu || menu.querySelector('#refExitExam')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'refExitExam';
    button.className = 'tool-item';
    button.innerHTML = '<span aria-hidden="true" class="ico-tool">⚠</span><span>Exit Bluebook</span>';
    button.addEventListener('click', openExitExam);
    menu.appendChild(button);
  }

  function openExitExam() {
    const app = state();
    document.getElementById('toolPopover')?.remove();
    closeDialog('refExitModal');
    const remainingMs = app?.endAt ? Math.max(0, app.endAt - Date.now()) : 0;
    const dialog = document.createElement('div');
    dialog.id = 'refExitModal';
    dialog.className = 'modal-backdrop';
    dialog.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="refExitTitle"><div class="modal-head"><h3 id="refExitTitle">Exit Bluebook?</h3><button class="icon-btn" id="refExitClose" aria-label="Cancel">×</button></div><p>Your answers are saved on this device. Exiting Bluebook pauses your testing timer temporarily. You will need to sign in again to continue testing.</p><p class="small">Use this only to recover from a technical problem. Keep this device with you and follow your proctor’s instructions.</p><div class="modal-actions"><button class="btn" id="refExitCancel">Cancel</button><button class="btn primary-action" id="refExitConfirm">Exit Bluebook</button></div></div>';
    document.body.appendChild(dialog);
    const close = () => dialog.remove();
    dialog.querySelector('#refExitClose').onclick = close;
    dialog.querySelector('#refExitCancel').onclick = close;
    dialog.querySelector('#refExitConfirm').onclick = () => {
      if (app) {
        app.recovery = {
          remainingMs,
          expiresAt: Date.now() + 10 * 60 * 1000,
        };
        app.endAt = null;
        app.password = '';
        app.screen = 'signin';
        save();
      }
      location.reload();
    };
    dialog.querySelector('#refExitCancel').focus();
  }

  function enhanceAssistiveTechnology() {
    const modal = document.getElementById('atModal');
    if (!modal || modal.dataset.refReady === '1') return;
    modal.dataset.refReady = '1';
    const name = state()?.student || 'Student';
    const content = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="atReferenceTitle"><div class="modal-head"><h3 id="atReferenceTitle">Assistive Technology</h3><button class="icon-btn" id="atReferenceClose" aria-label="Close">×</button></div><div class="at-tools-bar"><button class="btn link small" id="atExpand">Expand All</button><button class="btn link small" id="atCollapse">Collapse All</button></div><div class="at-body"><details open><summary>Speech-to-Text</summary><div class="at-copy"><p>Use the speech-to-text features available on your testing device for items requiring text entry, including free-response questions.</p><details open><summary>Chromebook Dictation</summary><div class="at-copy"><p>Chromebook provides options for using dictation from the accessibility menu:</p><ul><li>From the floating accessibility menu, select <strong>Dictation</strong>.</li><li>Select <strong>Onscreen keyboard</strong>, then choose <strong>Speak</strong> (microphone) when available.</li><li>You can move, float, dock, and resize the onscreen keyboard.</li></ul><p>Tap or select where you want to type. Use your device's dictation command to begin speaking.</p></div></details><details><summary>Windows Speech</summary><div class="at-copy"><p>On Windows, open <strong>Settings → Accessibility → Speech</strong> and turn on the available speech recognition feature.</p></div></details></div></details><details><summary>Magnification and display</summary><div class="at-copy"><p>Use browser or operating-system magnification and the simulator's zoom controls to enlarge content. Charts and images can also be viewed at higher zoom.</p></div></details><details><summary>Keyboard and assistive navigation</summary><div class="at-copy"><p>Keyboard shortcuts, focus movement, and reduced-motion preferences are supported throughout the exam surface.</p><p class="small">Student: ${escapeHtml(name)}</p></div></details></div><div class="modal-actions"><button class="btn cta-yellow" id="atReferenceDone">Close</button></div></div>`;
    modal.innerHTML = content;
    const close = () => modal.remove();
    modal.querySelector('#atReferenceClose').onclick = close;
    modal.querySelector('#atReferenceDone').onclick = close;
    modal.querySelector('#atExpand').onclick = () => modal.querySelectorAll('details').forEach(d => { d.open = true; });
    modal.querySelector('#atCollapse').onclick = () => modal.querySelectorAll('details').forEach(d => { d.open = false; });
    modal.querySelector('#atReferenceDone').focus();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  let transitionKey = '';
  function maybeShowModuleTransition() {
    const app = state();
    if (!app || app.screen !== 'directions') return;
    const candidates = app.mi === 1 ? 'rw1' : app.mi === 3 ? 'math1' : '';
    if (!candidates || !app.completed?.[candidates]) return;
    const key = `${candidates}:${app.mi}`;
    if (transitionKey === key || sessionStorage.getItem(`azm-transition-${key}`) === '1') return;
    sessionStorage.setItem(`azm-transition-${key}`, '1');
    transitionKey = key;
    const overlay = document.createElement('div');
    overlay.className = 'azm-module-transition';
    overlay.innerHTML = '<div class="azm-module-transition-inner"><h1>This Module Is Over</h1><p>All your work has been saved.</p><p>You’ll move on automatically in just a moment.</p><p>Do not refresh this page or quit the app.</p><div class="azm-loading-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div></div>';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.remove(); render(); }, 1800);
  }

  function maintain() {
    addDeviceTestButton();
    normalizeStudentLogin();
    hideDashboardExtras();
    addExitItem();
    enhanceAssistiveTechnology();
    maybeShowModuleTransition();
  }

  const observer = new MutationObserver(maintain);
  observer.observe(document.body, { childList: true, subtree: true });
  maintain();
})();
