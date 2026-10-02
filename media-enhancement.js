(() => {
  'use strict';

  const STORAGE_KEY = 'azaman-sat-practice-v3';
  const MAX_ZOOM = 3;
  const MIN_ZOOM = 1;
  let renderedMediaKey = null;

  const esc = (value) => String(value ?? '').replace(/[&<>'\"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;'
  }[c]));

  function state() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value?.v === 3 ? value : null;
    } catch (_) { return null; }
  }

  function currentQuestion() {
    const s = state();
    const all = window.SAT_QUESTIONS;
    if (!s || !all) return null;
    const mods = [
      { id: 'rw1', bank: () => all.rw1 || [] },
      { id: 'rw2', bank: () => all.rw2?.[s.adaptive?.rw] || [] },
      { id: 'math1', bank: () => all.math1 || [] },
      { id: 'math2', bank: () => all.math2?.[s.adaptive?.math] || [] },
    ];
    const mod = mods[s.mi];
    return mod ? mod.bank()[s.qi] || null : null;
  }

  function isSafeSrc(src) {
    try {
      const url = new URL(src, location.href);
      return url.origin === location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/media/'));
    } catch (_) { return false; }
  }

  function mediaKey(media) {
    if (!media || media.type !== 'image' || !isSafeSrc(media.src) || !media.alt) return 'none';
    return [media.type, media.src, media.alt, media.caption || ''].join('|');
  }

  function renderMedia() {
    const card = document.querySelector('.question-card');
    if (!card) return;
    const media = currentQuestion()?.media;
    const key = mediaKey(media);
    const marker = document.getElementById('azm-question-media');
    if (key === renderedMediaKey && ((key === 'none' && !marker) || marker)) return;
    marker?.remove();
    renderedMediaKey = key;
    if (key === 'none') return;

    const wrap = document.createElement('figure');
    wrap.id = 'azm-question-media';
    wrap.className = 'azm-media';
    wrap.innerHTML = `<button type="button" class="azm-media-trigger" aria-label="Enlarge image: ${esc(media.alt)}"><img class="azm-media-image" src="${esc(media.src)}" alt="${esc(media.alt)}" loading="eager"><span class="azm-media-hint">Open image</span></button>${media.caption ? `<figcaption>${esc(media.caption)}</figcaption>` : ''}`;
    const prompt = document.getElementById('questionPrompt');
    const choices = card.querySelector('.choices, .spr-wrap');
    if (prompt?.parentNode === card) prompt.insertAdjacentElement('afterend', wrap);
    else if (choices) card.insertBefore(wrap, choices);
    else card.appendChild(wrap);
    wrap.querySelector('.azm-media-trigger').addEventListener('click', (event) => openLightbox(media, event.currentTarget));
  }

  function openLightbox(media, trigger) {
    document.getElementById('azmMediaLightbox')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'azmMediaLightbox';
    overlay.className = 'azm-media-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'azmMediaTitle');
    const captionId = media.caption ? 'azmMediaCaption' : '';
    overlay.innerHTML = `<div class="azm-media-dialog">
      <div class="azm-media-toolbar" role="toolbar" aria-label="Image controls">
        <h2 id="azmMediaTitle" class="sr-only">Image viewer</h2>
        <button type="button" class="btn" data-media-action="zoom-out" aria-label="Zoom out">−</button>
        <span class="azm-media-zoom" aria-live="polite">100%</span>
        <button type="button" class="btn" data-media-action="zoom-in" aria-label="Zoom in">+</button>
        <button type="button" class="btn" data-media-action="reset" aria-label="Reset image view">Reset</button>
        <button type="button" class="icon-btn" data-media-action="close" aria-label="Close image">×</button>
      </div>
      <div class="azm-media-viewport" tabindex="0" aria-label="Image viewport"${captionId ? ` aria-describedby="${captionId}"` : ''}>
        <img class="azm-media-lightbox-image" src="${esc(media.src)}" alt="${esc(media.alt)}">
        <div class="azm-media-error" hidden role="status">The image could not be loaded.</div>
      </div>
      ${media.caption ? `<p id="${captionId}" class="small azm-media-caption">${esc(media.caption)}</p>` : ''}
    </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add('azm-media-open');

    const viewport = overlay.querySelector('.azm-media-viewport');
    const image = overlay.querySelector('.azm-media-lightbox-image');
    const error = overlay.querySelector('.azm-media-error');
    const zoomText = overlay.querySelector('.azm-media-zoom');
    const zoomIn = overlay.querySelector('[data-media-action="zoom-in"]');
    const zoomOut = overlay.querySelector('[data-media-action="zoom-out"]');
    const viewState = { scale: 1, x: 0, y: 0 };
    let closed = false;
    let pan = null;

    const getFocusable = () => [...overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.hidden && node.getAttribute('aria-hidden') !== 'true');

    const clampPan = () => {
      if (viewState.scale <= 1) {
        viewState.x = 0;
        viewState.y = 0;
        return;
      }
      const vr = viewport.getBoundingClientRect();
      const ir = image.getBoundingClientRect();
      const maxX = Math.max(0, (ir.width - vr.width) / 2 + 28);
      const maxY = Math.max(0, (ir.height - vr.height) / 2 + 28);
      viewState.x = Math.max(-maxX, Math.min(maxX, viewState.x));
      viewState.y = Math.max(-maxY, Math.min(maxY, viewState.y));
    };

    const updateControls = () => {
      zoomText.textContent = `${Math.round(viewState.scale * 100)}%`;
      zoomIn.disabled = viewState.scale >= 3;
      zoomOut.disabled = viewState.scale <= 1;
      viewport.classList.toggle('panning', viewState.scale > 1);
    };

    const render = () => {
      clampPan();
      image.style.transform = `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`;
      updateControls();
    };

    const applyZoom = (delta) => {
      viewState.scale = Math.max(1, Math.min(3, +(viewState.scale + delta).toFixed(2)));
      if (viewState.scale === 1) { viewState.x = 0; viewState.y = 0; }
      render();
    };

    const reset = () => {
      viewState.scale = 1;
      viewState.x = 0;
      viewState.y = 0;
      render();
    };

    const close = () => {
      if (closed) return;
      closed = true;
      document.body.classList.remove('azm-media-open');
      overlay.remove();
      if (trigger && trigger.isConnected) trigger.focus();
    };

    overlay.__azmMediaState = {
      get scale() { return viewState.scale; },
      set scale(value) { viewState.scale = Math.max(1, Math.min(3, Number(value) || 1)); render(); },
      get x() { return viewState.x; },
      set x(value) { viewState.x = Number(value) || 0; render(); },
      get y() { return viewState.y; },
      set y(value) { viewState.y = Number(value) || 0; render(); },
      render,
      applyZoom,
      reset,
      close
    };

    overlay.querySelectorAll('[data-media-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.mediaAction;
      if (action === 'zoom-in') applyZoom(.25);
      else if (action === 'zoom-out') applyZoom(-.25);
      else if (action === 'reset') reset();
      else if (action === 'close') close();
    }));

    image.addEventListener('error', () => {
      error.hidden = false;
      image.hidden = true;
    });
    image.addEventListener('load', render);

    viewport.addEventListener('pointerdown', (event) => {
      if (viewState.scale <= 1 || event.target.closest('button,[data-media-action]')) return;
      pan = { x: event.clientX, y: event.clientY, ox: viewState.x, oy: viewState.y };
      try { viewport.setPointerCapture?.(event.pointerId); } catch (_) {}
      event.preventDefault();
    });
    viewport.addEventListener('pointermove', (event) => {
      if (!pan) return;
      viewState.x = pan.ox + event.clientX - pan.x;
      viewState.y = pan.oy + event.clientY - pan.y;
      render();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => viewport.addEventListener(name, () => { pan = null; }));

    viewport.addEventListener('wheel', (event) => {
      if (!(event.ctrlKey || event.metaKey) && viewState.scale <= 1) return;
      event.preventDefault();
      applyZoom(event.deltaY < 0 ? .25 : -.25);
    }, { passive: false });

    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key === '+' || event.key === '=') { event.preventDefault(); applyZoom(.25); return; }
      if (event.key === '-') { event.preventDefault(); applyZoom(-.25); return; }
      if (event.key === '0') { event.preventDefault(); reset(); return; }
      if (event.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (viewState.scale > 1 && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const step = 24;
        viewState.x += event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
        viewState.y += event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
        render();
      }
    });

    render();
    overlay.querySelector('[data-media-action="close"]').focus();
  }

  const observer = new MutationObserver(renderMedia);
  const app = document.getElementById('app');
  if (app) observer.observe(app, { childList: true, subtree: true });
  renderMedia();
})();
