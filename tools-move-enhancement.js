(() => {
  'use strict';

  const MOVE_LABELS = {
    calculatorPanel: 'Move calculator',
    referencePanel: 'Move reference sheet',
    ttsPanel: 'Move Text-to-Speech'
  };
  const STEP = 24;

  function visible(el) {
    return !!el && el.getClientRects().length > 0;
  }

  function clampPosition(panel, left, top) {
    const width = panel.offsetWidth || 320;
    const height = panel.offsetHeight || 240;
    return {
      left: Math.max(8, Math.min(window.innerWidth - width - 8, left)),
      top: Math.max(8, Math.min(window.innerHeight - height - 8, top))
    };
  }

  function setPosition(panel, left, top) {
    const next = clampPosition(panel, left, top);
    panel.style.left = `${next.left}px`;
    panel.style.top = `${next.top}px`;
    panel.style.right = 'auto';
    panel.dataset.azmMovePosition = '1';
  }

  function ensurePosition(panel) {
    if (panel.dataset.azmMovePosition === '1') return;
    const rect = panel.getBoundingClientRect();
    setPosition(panel, rect.left, rect.top);
  }

  function togglePressed(move, panel) {
    ensurePosition(panel);
    const next = move.getAttribute('aria-pressed') !== 'true';
    move.setAttribute('aria-pressed', String(next));
    if (next) move.focus();
  }

  function addMoveControl(panel) {
    if (panel.dataset.azmMoveReady === '1') return;
    const head = panel.querySelector('.panel-head');
    if (!head) return;
    const close = head.querySelector('button');
    const move = document.createElement('button');
    move.type = 'button';
    move.className = 'icon-btn azm-move-button';
    move.setAttribute('aria-label', MOVE_LABELS[panel.id] || 'Move dialog');
    move.setAttribute('aria-pressed', 'false');
    move.title = 'Move with arrow keys';
    move.textContent = '⤢';
    if (close) head.insertBefore(move, close); else head.appendChild(move);

    // Pointer dragging mirrors the current Bluebook floating-tool behavior.
    // Only the panel header surface starts a drag; controls retain normal clicks.
    let pointerDrag = null;
    head.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button, input, select, textarea, a')) return;
      ensurePosition(panel);
      const rect = panel.getBoundingClientRect();
      pointerDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      try { head.setPointerCapture?.(event.pointerId); } catch (_) {}
      document.body.classList.add('azm-tool-dragging');
      event.preventDefault();
    });
    head.addEventListener('pointermove', (event) => {
      if (!pointerDrag || event.pointerId !== pointerDrag.id) return;
      setPosition(panel, pointerDrag.left + event.clientX - pointerDrag.x, pointerDrag.top + event.clientY - pointerDrag.y);
      event.preventDefault();
    });
    const endPointerDrag = (event) => {
      if (!pointerDrag || (event?.pointerId != null && event.pointerId !== pointerDrag.id)) return;
      try { head.releasePointerCapture?.(pointerDrag.id); } catch (_) {}
      pointerDrag = null;
      document.body.classList.remove('azm-tool-dragging');
    };
    head.addEventListener('pointerup', endPointerDrag);
    head.addEventListener('pointercancel', endPointerDrag);
    head.addEventListener('lostpointercapture', endPointerDrag);

    // Space/Enter use native button activation, which dispatches this click handler.
    move.addEventListener('click', () => togglePressed(move, panel));

    move.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && move.getAttribute('aria-pressed') === 'true') {
        event.preventDefault();
        move.setAttribute('aria-pressed', 'false');
        move.focus();
        return;
      }
      if (move.getAttribute('aria-pressed') !== 'true') return;
      const deltas = {
        ArrowLeft: [-STEP, 0],
        ArrowRight: [STEP, 0],
        ArrowUp: [0, -STEP],
        ArrowDown: [0, STEP]
      };
      const delta = deltas[event.key];
      if (!delta) return;
      const rect = panel.getBoundingClientRect();
      setPosition(panel, rect.left + delta[0], rect.top + delta[1]);
      event.preventDefault();
    });

    panel.dataset.azmMoveReady = '1';
  }

  function enhance(panel) {
    if (!visible(panel)) return;
    addMoveControl(panel);
  }

  const observer = new MutationObserver(() => {
    enhance(document.getElementById('calculatorPanel'));
    enhance(document.getElementById('referencePanel'));
    enhance(document.getElementById('ttsPanel'));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => {
    document.querySelectorAll('#calculatorPanel, #referencePanel, #ttsPanel').forEach((panel) => {
      if (panel.dataset.azmMovePosition !== '1') return;
      const rect = panel.getBoundingClientRect();
      setPosition(panel, rect.left, rect.top);
    });
  });
})();
