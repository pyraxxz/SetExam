(() => {
  'use strict';

  const getState = () => window.AZAMAN_APP?.getState?.();
  const save = () => window.AZAMAN_APP?.save?.();
  const render = () => window.AZAMAN_APP?.render?.();

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[c]));
  }

  function logoSvg() {
    return `<img class="ref2-logo" src="assets/bluebook-logo.jpg?v=22" alt="" aria-hidden="true">`;
  }

  function deviceButton() {
    const onAccess = !!document.querySelector('.access-page');
    const existing = document.getElementById('deviceTestBtn');
    if (existing && !onAccess) { existing.remove(); return; }
    if (!onAccess || existing) return;
    const button = document.createElement('button');
    button.id = 'deviceTestBtn';
    button.type = 'button';
    button.textContent = 'Test Your Device';
    button.addEventListener('click', openDeviceDialog);
    document.body.appendChild(button);
  }

  function detectPlatform() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    if (/CrOS/i.test(ua)) return 'ChromeOS';
    if (/iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iPadOS';
    if (/iPhone|iPod/i.test(ua)) return 'iOS';
    if (/Mac/i.test(platform)) return 'macOS';
    if (/Win/i.test(platform)) return 'Windows';
    if (/Linux/i.test(platform)) return 'Linux';
    return 'Other';
  }

  function openDeviceDialog() {
    document.getElementById('ref2DeviceDialog')?.remove();
    const memory = Number.isFinite(navigator.deviceMemory) ? `${navigator.deviceMemory} GB` : 'Not exposed';
    const storageReady = !!navigator.storage?.estimate;
    const osReady = !!detectPlatform();
    const viewportReady = window.innerWidth >= 800 && window.innerHeight >= 500;
    const localReady = !!window.localStorage;
    const items = [
      ['Memory', memory, Number.isFinite(navigator.deviceMemory)],
      ['Operating system', detectPlatform(), osReady],
      ['Disk space', storageReady ? 'Checking…' : 'Unavailable', storageReady],
      ['Device lock', 'Not verified in browser', null],
      ['Verified mode', 'Not verified in browser', null],
    ];
    const dialog = document.createElement('div');
    dialog.id = 'ref2DeviceDialog';
    dialog.className = 'modal-backdrop';
    dialog.innerHTML = `<div class="modal ref2-device-dialog" role="dialog" aria-modal="true" aria-labelledby="ref2DeviceTitle"><div class="modal-head"><h3 id="ref2DeviceTitle">Test Your Device</h3><button class="icon-btn" id="ref2DeviceClose" aria-label="Close">×</button></div><h4 class="ref2-device-result">${viewportReady && localReady ? 'This Device Meets the Requirements' : 'Check Your Device'}</h4><p class="ref2-device-lead">Bluebook checks the device settings that are visible to the testing application before test day.</p><div class="ref2-device-list">${items.map(([name,value,ok], i) => `<div class="ref2-device-row" data-device-row="${i}"><span>${escapeHtml(name)}</span><span class="ref2-device-value">${escapeHtml(value)}</span><strong class="ref2-device-state ${ok === null ? 'info' : ok ? 'ok' : 'warn'}" aria-label="${ok === null ? 'Not verified' : ok ? 'Ready' : 'Check'}">${ok === null ? 'i' : ok ? '✓' : '!'}</strong></div>`).join('')}</div><p class="small">This simulator runs these checks locally. Browser code cannot reliably verify secure device lock or managed verified-mode settings; use your testing-device guidance for those checks.</p><div class="modal-actions"><button class="btn cta-yellow" id="ref2DeviceDone">Done</button></div></div>`;
    document.body.appendChild(dialog);
    const close = () => dialog.remove();
    dialog.querySelector('#ref2DeviceClose').onclick = close;
    dialog.querySelector('#ref2DeviceDone').onclick = close;
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ quota, usage }) => {
        const value = Number.isFinite(quota) && Number.isFinite(usage) ? `${Math.max(0, (quota - usage) / 1073741824).toFixed(2)} GB estimated free` : 'Unavailable';
        const row = dialog.querySelector('[data-device-row="2"] .ref2-device-value');
        if (row && dialog.isConnected) row.textContent = value;
      }).catch(() => {});
    }
    dialog.querySelector('#ref2DeviceDone').focus();
  }

  function accessBrand() {
    const page = document.querySelector('.access-page');
    if (!page || page.querySelector('.ref2-access-brand')) return;
    const brand = document.createElement('div');
    brand.className = 'ref2-access-brand';
    brand.innerHTML = `${logoSvg()}<span>Bluebook</span>`;
    page.prepend(brand);
  }

  function normalizeAccountForm() {
    const page = document.querySelector('.access-page');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const student = document.getElementById('student');
    if (!page || !email || !password || !student) return;
    const emailLabel = email.closest('.field')?.querySelector('label');
    const passwordLabel = password.closest('.field')?.querySelector('label');
    if (emailLabel && emailLabel.textContent !== 'Email Address') emailLabel.textContent = 'Email Address';
    if (passwordLabel && passwordLabel.textContent !== 'Password') passwordLabel.textContent = 'Password';
    const syncStudent = () => {
      if (student.value.trim()) return;
      const local = email.value.trim().split('@')[0].replace(/[._-]+/g, ' ').trim();
      student.value = local || 'Student';
      student.dispatchEvent(new Event('input', { bubbles: true }));
    };
    if (email.dataset.ref2Ready !== '1') {
      email.dataset.ref2Ready = '1';
      email.addEventListener('input', syncStudent, { passive: true });
    }
    syncStudent();
  }

  function dashboardPolish() {
    const page = document.querySelector('.yourtests-page');
    if (!page) return;
    const name = page.querySelector('.test-name');
    if (name && name.textContent.trim() === 'SAT') name.textContent = 'Digital SAT';
  }

  function patchAssistiveTechnology() {
    const modal = document.getElementById('atModal');
    if (!modal || modal.dataset.ref2Ready === '1') return;
    modal.dataset.ref2Ready = '1';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="atRef2Title"><div class="modal-head"><h3 id="atRef2Title">Assistive Technology</h3><button class="icon-btn" id="atRef2Close" aria-label="Close">×</button></div><div class="at-tools-bar"><button class="btn link small" id="atRef2Expand">Expand All</button><button class="btn link small" id="atRef2Collapse">Collapse All</button></div><div class="at-body"><details open><summary>Speech-to-Text</summary><div class="at-copy"><details open><summary>Chromebook Dictation</summary><div class="at-copy"><p>Chromebook provides dictation from the accessibility menu for text-entry questions.</p><ul><li>Open the floating accessibility menu and select <strong>Dictation</strong>.</li><li>For the onscreen keyboard, select <strong>Speak</strong> (microphone) when available.</li><li>The onscreen keyboard can be moved, floated, docked, and resized.</li></ul><p>Select the response field before speaking.</p></div></details><details><summary>Windows Speech</summary><div class="at-copy"><p>Use the Windows accessibility speech controls from <strong>Settings → Accessibility → Speech</strong>.</p></div></details></div></details><details><summary>Magnification</summary><div class="at-copy"><p>Use supported operating-system or application magnification tools to enlarge readable test content.</p></div></details><details><summary>Keyboard access</summary><div class="at-copy"><p>Use the exam's keyboard shortcuts and focus movement commands to reach major regions and tools without a mouse.</p></div></details></div><div class="modal-actions"><button class="btn cta-yellow" id="atRef2Done">Close</button></div></div>`;
    const close = () => modal.remove();
    modal.querySelector('#atRef2Close').onclick = close;
    modal.querySelector('#atRef2Done').onclick = close;
    modal.querySelector('#atRef2Expand').onclick = () => modal.querySelectorAll('details').forEach((d) => { d.open = true; });
    modal.querySelector('#atRef2Collapse').onclick = () => modal.querySelectorAll('details').forEach((d) => { d.open = false; });
    modal.querySelector('#atRef2Done').focus();
  }

  function moreExitIcon() {
    const button = document.getElementById('refExitExam');
    if (!button || button.dataset.ref2Ready === '1') return;
    button.dataset.ref2Ready = '1';
    button.innerHTML = `<svg class="ico-tool" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 21 20H3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Exit the exam</span>`;
  }

  function actualStartCodeSurface() {
    const s = getState();
    if (!s || s.harness || s.screen !== 'checkin' || s.step !== 8) return;
    if (document.getElementById('azmStartCodePage')) return;
    const app = document.getElementById('app');
    if (!app) return;
    const code = String(s.startCode || '');
    app.innerHTML = `<main id="azmStartCodePage" class="azm-start-code-page"><header class="azm-flow-header"><button id="azmStartHelp" type="button" class="azm-flow-link">? Help</button><button id="azmStartHome" type="button" class="azm-flow-link">Return to Home <span aria-hidden="true" class="azm-home-icon">⌂</span></button></header><section class="azm-start-code-content"><h1>Start Code</h1><p>Enter your start code now to begin testing. Good luck!</p><p>The start code contains <strong>numbers only.</strong></p><div class="azm-start-code-boxes" aria-label="Start code">${Array.from({length:6},(_,i)=>`<input class="azm-start-digit" maxlength="1" inputmode="numeric" autocomplete="off" data-pos="${i}" aria-label="Start code digit ${i+1} of 6" value="${escapeHtml(code[i]||'')}">`).join('')}</div><button id="azmStartTest" type="button" class="azm-start-test">Start Test</button></section><p class="azm-start-note">You can <button id="azmReviewInstructions" type="button">review the instructions</button> that the proctor reads aloud.</p></main>`;
    const boxes = [...app.querySelectorAll('.azm-start-digit')];
    const sync = () => { s.startCode = boxes.map((b) => b.value).join(''); save(); };
    boxes.forEach((box) => {
      box.addEventListener('input', (e) => { box.value = e.target.value.replace(/\D/g,'').slice(-1); const i = Number(box.dataset.pos); sync(); if (box.value && i < boxes.length - 1) boxes[i+1].focus(); });
      box.addEventListener('keydown', (e) => { const i=Number(box.dataset.pos); if(e.key==='Backspace'&&!box.value&&i>0){boxes[i-1].focus();e.preventDefault();} });
      box.addEventListener('focus', () => box.select());
    });
    document.getElementById('azmStartHelp')?.addEventListener('click', () => window.AZAMAN_HELP?.() || alert('Ask your proctor for help.'));
    document.getElementById('azmStartHome')?.addEventListener('click', () => { s.screen='yourtests'; save(); render(); });
    document.getElementById('azmReviewInstructions')?.addEventListener('click', () => alert('Your proctor will read the test instructions aloud before the test begins.'));
    document.getElementById('azmStartTest')?.addEventListener('click', () => { sync(); if(s.startCode.length!==6) return; s.step=10; s.screen='directions'; s.mi=0; s.qi=0; s.endAt=null; save(); render(); });
    boxes.find((b) => !b.value)?.focus();
  }

  function actualDirectionsSurface() {
    const s = getState();
    if (!s || s.harness || s.screen !== 'directions') return;
    if (document.getElementById('azmDirectionsPage')) return;
    const modules = [
      {section:'Reading and Writing',label:'Module 1',minutes:32,count:27},
      {section:'Reading and Writing',label:'Module 2',minutes:32,count:27},
      {section:'Math',label:'Module 1',minutes:35,count:22},
      {section:'Math',label:'Module 2',minutes:35,count:22},
    ];
    const m = modules[Math.max(0,Math.min(3,Number(s.mi)||0))];
    const secNum = m.section === 'Math' ? '2' : '1';
    const math = m.section === 'Math';
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `<main id="azmDirectionsPage" class="azm-directions-page"><header class="azm-directions-top"><div class="azm-directions-left"><strong>Section ${secNum}: ${escapeHtml(m.section)}</strong><button id="azmDirectionsMenu" class="azm-directions-link">Directions <span aria-hidden="true">⌄</span></button></div><div class="azm-directions-timer">${m.minutes}:00<button id="azmDirectionsHide" type="button">Hide</button></div><div class="azm-directions-tools">${math?'<button type="button">▣<span>Calculator</span></button><button type="button">▤<span>Reference</span></button>':'<button type="button">✎<span>Highlights &amp; Notes</span></button>'}<button type="button">⋮<span>More</span></button></div></header><div class="azm-directions-stripe" aria-hidden="true"></div><section class="azm-directions-panel"><h2>Section ${secNum}, ${escapeHtml(m.label)}: ${m.count} Questions</h2><ul><li>This module is made up of multiple-choice questions.</li><li>You can move back and forth between questions until time expires.</li><li>At the end of the module, you can review your answers until time expires.</li><li>Once the next module begins, you cannot return to these questions.</li></ul><button id="beginModuleBtn" type="button" class="azm-directions-continue">Continue</button></section></main>`;
    document.getElementById('azmDirectionsHide')?.addEventListener('click', (e) => { e.currentTarget.textContent = e.currentTarget.textContent === 'Hide' ? 'Show' : 'Hide'; });
    document.getElementById('azmDirectionsMenu')?.addEventListener('click', () => alert('These directions explain how this module works.'));
    document.getElementById('beginModuleBtn')?.addEventListener('click', () => {
      const current = getState();
      if (!current || current.screen !== 'directions') return;
      current.endAt = Date.now() + m.minutes * 60000;
      current.qi = 0;
      save();
      render();
    });
  }

  let seenRw2 = false;
  let seenMath2 = false;
  let initialized = false;

  function moduleTransitions() {
    const s = getState();
    if (!s || !s.completed) return;
    if (!initialized) {
      seenRw2 = !!s.completed.rw2;
      seenMath2 = !!s.completed.math2;
      initialized = true;
      return;
    }
    if (s.completed.rw2 && !seenRw2) { seenRw2 = true; showModuleTransition(); }
    if (s.completed.math2 && !seenMath2) { seenMath2 = true; showModuleTransition(); }
  }

  function showModuleTransition() {
    if (document.querySelector('.azm-module-transition')) return;
    const overlay = document.createElement('div');
    overlay.className = 'azm-module-transition';
    overlay.innerHTML = '<div class="azm-module-transition-inner"><h1>This Module Is Over</h1><p>All your work has been saved.</p><p>You’ll move on automatically in just a moment.</p><p>Do not refresh this page or quit the app.</p><div class="azm-loading-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div></div>';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.remove(); render(); }, 1800);
  }

  function maintain() {
    accessBrand();
    deviceButton();
    normalizeAccountForm();
    dashboardPolish();
    patchAssistiveTechnology();
    moreExitIcon();
    actualStartCodeSurface();
    actualDirectionsSurface();
    moduleTransitions();
  }

  const observer = new MutationObserver(maintain);
  observer.observe(document.body, { childList: true, subtree: true });
  maintain();
})();

(() => {
  'use strict';
  const KEY = 'azm-exam-source-width-v1';
  const MIN = 35;
  const MAX = 65;
  const clamp = (value) => Math.min(MAX, Math.max(MIN, Number(value) || 48));
  const readRatio = () => {
    try { const value = Number(localStorage.getItem(KEY)); return Number.isFinite(value) ? clamp(value) : 48; }
    catch (_) { return 48; }
  };
  const writeRatio = (value) => {
    try { localStorage.setItem(KEY, String(Math.round(clamp(value) * 10) / 10)); } catch (_) {}
  };
  const applyRatio = (main, value) => {
    const ratio = clamp(value);
    document.documentElement.style.setProperty('--azm-exam-source-width', ratio + '%');
    main?.style.setProperty('--azm-exam-source-width', ratio + '%');
    const splitter = document.getElementById('examSplitter');
    if (splitter) {
      splitter.setAttribute('aria-valuenow', String(Math.round(ratio)));
      splitter.setAttribute('aria-valuetext', Math.round(ratio) + '% passage, ' + Math.round(100 - ratio) + '% question');
    }
  };
  function bindExamSplitter() {
    const main = document.querySelector('.test-main');
    const splitter = document.getElementById('examSplitter');
    if (!main || !splitter || splitter.dataset.examSplitterReady === '1') return;
    splitter.dataset.examSplitterReady = '1';
    applyRatio(main, readRatio());
    let dragging = false;
    let pointerId = null;
    const ratioFromPointer = (clientX) => {
      const rect = main.getBoundingClientRect();
      return rect.width ? clamp(((clientX - rect.left) / rect.width) * 100) : readRatio();
    };
    const setDragging = (value) => {
      dragging = value;
      main.classList.toggle('is-resizing', value);
      document.body.classList.toggle('exam-resizing', value);
      if (!value) pointerId = null;
    };
    splitter.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      try { splitter.setPointerCapture?.(pointerId); } catch (_) {}
      setDragging(true);
      applyRatio(main, ratioFromPointer(event.clientX));
      event.preventDefault();
    });
    splitter.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      applyRatio(main, ratioFromPointer(event.clientX));
      event.preventDefault();
    });
    const finishPointer = (event) => {
      if (!dragging) return;
      if (event?.pointerId != null && pointerId != null && event.pointerId !== pointerId) return;
      const ratio = Number(getComputedStyle(document.documentElement).getPropertyValue('--azm-exam-source-width').replace('%', '')) || 48;
      writeRatio(ratio);
      try { splitter.releasePointerCapture?.(pointerId); } catch (_) {}
      setDragging(false);
    };
    splitter.addEventListener('pointerup', finishPointer);
    splitter.addEventListener('pointercancel', finishPointer);
    splitter.addEventListener('lostpointercapture', () => {
      if (!dragging) return;
      const ratio = Number(getComputedStyle(document.documentElement).getPropertyValue('--azm-exam-source-width').replace('%', '')) || 48;
      writeRatio(ratio);
      setDragging(false);
    });
    splitter.addEventListener('keydown', (event) => {
      const current = Number(getComputedStyle(document.documentElement).getPropertyValue('--azm-exam-source-width').replace('%', '')) || 48;
      let next = current;
      if (event.key === 'ArrowLeft') next -= 1;
      else if (event.key === 'ArrowRight') next += 1;
      else if (event.key === 'PageUp') next += 5;
      else if (event.key === 'PageDown') next -= 5;
      else if (event.key === 'Home') next = MIN;
      else if (event.key === 'End') next = MAX;
      else return;
      event.preventDefault();
      applyRatio(main, next);
      writeRatio(next);
    });
  }
  function observeExamSplitter() {
    bindExamSplitter();
    const app = document.getElementById('app');
    if (app && !observeExamSplitter.bound) {
      observeExamSplitter.bound = true;
      new MutationObserver(bindExamSplitter).observe(app, { childList: true, subtree: true });
    }
  }
  observeExamSplitter();
})();
