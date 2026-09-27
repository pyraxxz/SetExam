(() => {
  'use strict';

  const platform = `${navigator.platform || ''} ${navigator.userAgent || ''}`;
  const isChromeOS = /CrOS/i.test(platform);
  const isMac = /Mac|iPhone|iPad|iPod/i.test(platform);
  const isIPad = /iPad/i.test(platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const shortcuts = [
    ['F1 (Windows/macOS/iPad)', 'Keyboard shortcuts'],
    ['Control + Search + S (ChromeOS)', 'Keyboard shortcuts'],
    ['F6 / Shift+F6', 'Move between exam regions'],
    ['Ctrl + + / Ctrl + - / Ctrl + 0 or Command equivalents', 'Zoom in / out / reset'],
    ['Ctrl + Alt + B / Command + Control + B', 'Back'],
    ['Ctrl + P', 'Next question / next module (skips directions and break gates)'],
    ['Ctrl + O', 'Previous question / previous module'],
    ['Ctrl + Alt + X / Command + Control + X', 'Next / review module'],
    ['Ctrl + Alt + G / Command + Control + G', 'Question menu'],
    ['Ctrl + Alt + H / Command + Control + H / iPad: Command + Control + P', 'Help'],
    ['Ctrl + Alt + Shift + D / Command + Control + Shift + D', 'Directions'],
    ['Ctrl + L / Command + L', 'Line reader'],
    ['Ctrl + Alt + T / Command + Option + T', 'Hide/show timer or close the 5-minute message'],
    ['Ctrl + Alt + V / Command + Shift + V', 'Mark for Review'],
    ['Ctrl + H', 'Highlights & Notes'],
    ['Ctrl + Alt + C / Command + Option + C', 'Calculator'],
    ['Ctrl + Alt + R / Command + Option + R', 'Reference sheet'],
    ['Ctrl + Alt + O / Command + Control + O', 'Option eliminator'],
    ['Ctrl + Alt + 1–4 / Command + Option + 1–4', 'Eliminate option A–D'],
    ['Ctrl + Shift + 1–4 / Command + Control + 1–4', 'Select option A–D'],
    ['Alt + P / Option + P', 'Text-to-Speech play/pause'],
    ['Alt + C / Option + C', 'Text-to-Speech Click Mode'],
  ];

  const isTyping = (target) => {
    if (!target) return false;
    const tag = target.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
  };
  const visible = (el) => !!el && el.getClientRects().length > 0;
  const buttonsByText = (label) => [...document.querySelectorAll('button')]
    .find((b) => visible(b) && b.textContent.trim().toLowerCase() === label.toLowerCase());
  const clickText = (label) => {
    const button = buttonsByText(label);
    if (!button) return false;
    button.click();
    return true;
  };

  function openToolByText(label, fallback) {
    if (clickText(label)) return true;
    const tools = buttonsByText('More') || document.getElementById('toolsBtn');
    if (!tools) { fallback?.(); return false; }
    tools.click();
    requestAnimationFrame(() => { if (!clickText(label)) fallback?.(); });
    return true;
  }

  function regionNodes() {
    return [document.querySelector('.test-top'), document.querySelector('.source-panel'), document.querySelector('.question-panel'), document.querySelector('.test-footer')].filter(Boolean);
  }

  function focusRegion(direction) {
    const nodes = regionNodes();
    if (!nodes.length) return;
    nodes.forEach((node) => { if (node.tabIndex < 0) node.tabIndex = 0; });
    const active = document.activeElement;
    let index = nodes.findIndex((node) => node === active || node.contains(active));
    if (index < 0) index = direction > 0 ? -1 : 0;
    const next = nodes[(index + direction + nodes.length) % nodes.length];
    next.focus({ preventScroll: false });
    next.scrollIntoView({ block: 'nearest' });
  }

  function openShortcuts() {
    document.getElementById('shortcutHelp')?.remove();
    const n = document.createElement('div');
    n.id = 'shortcutHelp'; n.className = 'modal-backdrop';
    n.innerHTML = `<div class="modal shortcut-help" role="dialog" aria-modal="true" aria-labelledby="shortcutTitle"><div class="modal-head"><h3 id="shortcutTitle">Keyboard shortcuts</h3><button class="icon-btn" id="shortcutClose" aria-label="Close">×</button></div><div class="shortcut-list">${shortcuts.map(([key, desc]) => `<div class="shortcut-row"><kbd>${key}</kbd><span>${desc}</span></div>`).join('')}</div><div class="modal-actions"><button class="btn" id="shortcutDone">Done</button></div></div>`;
    document.body.appendChild(n);
    const close = () => { n.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    n.querySelector('#shortcutClose').onclick = close;
    n.querySelector('#shortcutDone').onclick = close;
    n.querySelector('#shortcutDone').focus();
  }

  function openHelp() {
    document.getElementById('helpDialog')?.remove();
    const n = document.createElement('div');
    n.id = 'helpDialog'; n.className = 'modal-backdrop';
    n.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="helpTitle"><div class="modal-head"><h3 id="helpTitle">Help</h3><button class="icon-btn" id="helpClose" aria-label="Close help">×</button></div><p>Use the question menu to move between questions, Mark for Review to flag work, and More for notes, highlighting, the line reader, timer controls, calculator, reference sheet, and zoom.</p><p>Your responses are saved automatically. Ctrl + P and Ctrl + O can move through questions, modules, directions, and the break without waiting.</p><div class="modal-actions"><button class="btn" id="helpShortcuts">Keyboard shortcuts</button><button class="btn" id="helpDone">Done</button></div></div>`;
    document.body.appendChild(n);
    const close = () => { n.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    n.querySelector('#helpClose').onclick = close;
    n.querySelector('#helpDone').onclick = close;
    n.querySelector('#helpShortcuts').onclick = () => { close(); openShortcuts(); };
    n.querySelector('#helpDone').focus();
  }

  function openDirections() {
    const existing = document.getElementById('directionHelp');
    if (existing) {
      existing.querySelector('#directionDone, #directionClose')?.click();
      return;
    }
    const title = document.querySelector('.test-title')?.textContent?.trim() || 'Current module';
    const n = document.createElement('div');
    n.id = 'directionHelp'; n.className = 'modal-backdrop';
    n.innerHTML = `<div class="modal directions-modal" role="dialog" aria-modal="true" aria-labelledby="directionTitle"><div class="modal-head"><h3 id="directionTitle">${title} directions</h3><button class="icon-btn" id="directionClose" aria-label="Close">×</button></div><p>Review each question before moving on. You can use the question menu to move within this module. Your response is saved automatically.</p><p>Use the available test tools when appropriate. The module timer continues while these directions are open.</p><div class="modal-actions"><button class="btn" id="directionDone">Continue testing</button></div></div>`;
    document.body.appendChild(n);
    const close = () => { n.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    n.querySelector('#directionClose').onclick = close;
    n.querySelector('#directionDone').onclick = close;
    n.querySelector('#directionDone').focus();
  }

  function closeModal() {
    const lightbox = document.getElementById('azmMediaLightbox');
    if (lightbox) { lightbox.querySelector('[data-media-action="close"]')?.click(); return true; }
    const modal = document.querySelector('.modal-backdrop[role="dialog"]');
    if (!modal) return false;
    const close = modal.querySelector('#shortcutClose, #shortcutDone, #helpClose, #helpDone, #directionClose, #directionDone, #closeReview, #closeReview2, #dismissWarn');
    if (close) { close.click(); return true; }
    return false;
  }

  function triggerOption(number, mode) {
    const target = mode === 'select'
      ? [...document.querySelectorAll('[data-answer]')].filter(visible)[number - 1]
      : document.querySelector(`[data-eliminate="${number - 1}"]`);
    target?.click();
  }

  function nextShortcut() {
    const next = document.getElementById('nextBtn');
    if (visible(next)) { next.click(); return; }
    clickText('Next') || clickText('Review module');
  }

  function backShortcut() {
    const previous = document.getElementById('prevBtn');
    if (visible(previous)) { previous.click(); return; }
    clickText('Back');
  }

  function toggleDialogById(id, opener) {
    if (document.getElementById(id)) {
      document.getElementById(id).remove();
      return;
    }
    opener();
  }

  function onKeydown(event) {
    const key = event.key;
    const lower = key.toLowerCase();
    const ctrl = event.ctrlKey;
    const command = event.metaKey;
    const alt = event.altKey;
    if (key === 'Escape' && closeModal()) { event.preventDefault(); return; }
    if (key === 'F1' && !isChromeOS) { event.preventDefault(); openShortcuts(); return; }
    if (isChromeOS && ctrl && command && lower === 's') { event.preventDefault(); openShortcuts(); return; }
    const state = window.AZAMAN_APP?.getState?.();
    const examScreens = new Set(['test', 'directions', 'break', 'finish']);
    if (!document.querySelector('.test-shell') && !examScreens.has(state?.screen)) return;
    if (key === 'F6') { event.preventDefault(); focusRegion(event.shiftKey ? -1 : 1); return; }

    const zoomMod = isMac ? command : ctrl;
    if (zoomMod && (key === '+' || key === '=')) { event.preventDefault(); document.documentElement.style.setProperty('--zoom-scale', String(Math.min(1.25, (Number(getComputedStyle(document.documentElement).getPropertyValue('--zoom-scale')) || 1) + 0.05))); return; }
    if (zoomMod && (key === '-' || key === '_')) { event.preventDefault(); document.documentElement.style.setProperty('--zoom-scale', String(Math.max(0.85, (Number(getComputedStyle(document.documentElement).getPropertyValue('--zoom-scale')) || 1) - 0.05))); return; }
    if (zoomMod && key === '0') { event.preventDefault(); document.documentElement.style.setProperty('--zoom-scale', '1'); return; }
    if (isTyping(event.target)) return;

    const navigateExamPage = window.AZAMAN_APP?.navigateExamPage;
    if (ctrl && !alt && !command && lower === 'p') { event.preventDefault(); if (navigateExamPage?.('next')) return; }
    if (ctrl && !alt && !command && lower === 'o') { event.preventDefault(); navigateExamPage?.('previous'); return; }

    const triple = isMac ? command && ctrl : ctrl && alt;
    const comboAlt = isMac ? command && alt : ctrl && alt;
    const navCombo = isMac ? command && ctrl && !alt : ctrl && alt;

    if (navCombo && lower === 'b') { event.preventDefault(); backShortcut(); return; }
    if (navCombo && lower === 'x') { event.preventDefault(); nextShortcut(); return; }
    if (navCombo && lower === 'g') { event.preventDefault(); toggleDialogById('reviewModal', () => document.getElementById('reviewBtn')?.click()); return; }
    if ((isIPad && command && ctrl && lower === 'p') || (isMac && command && ctrl && lower === 'h') || (!isMac && !isIPad && ctrl && alt && lower === 'h')) { event.preventDefault(); openHelp(); return; }
    if (navCombo && event.shiftKey && lower === 'd') { event.preventDefault(); openDirections(); return; }
    if ((isMac ? command : ctrl) && !alt && lower === 'l') { event.preventDefault(); const lineTool = document.getElementById('lineTool'); if (lineTool) lineTool.click(); else { const app = window.AZAMAN_APP; const state = app?.getState?.(); if (state) { state.lineReader = !state.lineReader; app.save(); app.render(); } } return; }
    if (comboAlt && lower === 't') { event.preventDefault(); const t = document.getElementById('hideTimerBtn'); if (t) t.click(); else openToolByText('Hide timer', () => openToolByText('Show timer')); return; }
    if (alt && !ctrl && !command && lower === 'p' && window.AZAMAN_TTS_PLAY_PAUSE) { event.preventDefault(); window.AZAMAN_TTS_PLAY_PAUSE(); return; }
    if (alt && !ctrl && !command && lower === 'c' && window.AZAMAN_TTS_CLICKMODE) { event.preventDefault(); window.AZAMAN_TTS_CLICKMODE(); return; }
    if (isMac ? command && event.shiftKey && lower === 'v' : ctrl && alt && lower === 'v') { event.preventDefault(); clickText('Mark for review'); return; }
    if (ctrl && !alt && lower === 'h') { event.preventDefault(); if (String(window.getSelection?.() || '').trim() && typeof highlight === 'function') highlight(); else openToolByText('Highlights & Notes'); return; }
    if (comboAlt && lower === 'c') { event.preventDefault(); toggleDialogById('calculatorPanel', () => openToolByText('Calculator')); return; }
    if (comboAlt && lower === 'r') { event.preventDefault(); toggleDialogById('referencePanel', () => { const r = document.getElementById('refToolBtn'); if (r) r.click(); else openToolByText('Reference sheet'); }); return; }
    if (navCombo && lower === 'o') { event.preventDefault(); document.body.classList.toggle('option-eliminator-mode'); return; }
    if (comboAlt && /^[1-4]$/.test(key)) { event.preventDefault(); triggerOption(Number(key), 'eliminate'); return; }
    if (isMac ? triple && /^[1-4]$/.test(key) : ctrl && event.shiftKey && /^[1-4]$/.test(key)) { event.preventDefault(); triggerOption(Number(key), 'select'); return; }
  }

  window.AZAMAN_HELP = openHelp; window.AZAMAN_SHORTCUTS = openShortcuts;
  document.addEventListener('keydown', onKeydown, true);
  const app = document.getElementById('app');
  if (app) new MutationObserver(() => {
    if (!document.querySelector('.test-shell')) return;
    regionNodes().forEach((node) => { if (node.tabIndex < 0) node.tabIndex = 0; });
  }).observe(app, { childList: true, subtree: true });
})();
