(() => {
  'use strict';

  const installed = new WeakSet();

  function install(overlay) {
    if (!overlay || installed.has(overlay)) return;
    const viewport = overlay.querySelector('.azm-media-viewport');
    const state = overlay.__azmMediaState;
    if (!viewport || !state) return;
    installed.add(overlay);

    const pointers = new Map();
    let pinch = null;
    const clampZoom = (value) => Math.max(1, Math.min(3, value));

    viewport.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button,[data-media-action]')) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        pinch = distance > 0 ? { distance } : null;
      }
      try { viewport.setPointerCapture?.(event.pointerId); } catch (_) {}
    }, { passive: true });

    viewport.addEventListener('pointermove', (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size !== 2 || !pinch) return;
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (!Number.isFinite(distance) || pinch.distance <= 0) return;
      state.scale = clampZoom(state.scale * (distance / pinch.distance));
      pinch.distance = distance;
      event.preventDefault();
    }, { passive: false });

    const stop = (event) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = null;
    };
    viewport.addEventListener('pointerup', stop);
    viewport.addEventListener('pointercancel', stop);
    viewport.addEventListener('lostpointercapture', stop);
  }

  const observer = new MutationObserver(() => {
    const overlay = document.getElementById('azmMediaLightbox');
    if (!overlay || !overlay.__azmMediaState) return;
    install(overlay);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
