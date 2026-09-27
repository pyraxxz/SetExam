(() => {
  'use strict';
  const synth = () => window.speechSynthesis;
  let utterance = null;
  let segments = [];
  let segmentIndex = 0;
  let speed = 1;
  let volume = 1;
  let clickMode = false;

  const icon = '<svg class="ico-tool" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 9.5c1.3 1.3 1.3 3.7 0 5M18.7 7c2.7 2.7 2.7 7.3 0 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function rootText() {
    const root = document.querySelector('.azm-test-preview-shell') || document.querySelector('.test-shell');
    if (!root) return '';
    const source = root.querySelector('.source-panel')?.innerText || '';
    const prompt = root.querySelector('#questionPrompt, #previewQuestionPrompt')?.innerText || '';
    const choices = [...root.querySelectorAll('.choice-text')].map((el) => el.innerText).join('. ');
    return [source, prompt, choices].filter(Boolean).join('. ').replace(/\s+/g, ' ').trim();
  }

  function splitText(text) {
    return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) || [];
  }

  function stopSpeech(reset = true) {
    synth()?.cancel();
    utterance = null;
    if (reset) { segmentIndex = 0; }
    updateStatus(reset ? 'Stopped. Ready to read again.' : 'Paused.');
  }

  function speakSegment(index) {
    if (!synth() || !segments.length) { updateStatus('Text-to-Speech is not available in this browser.'); return; }
    segmentIndex = Math.max(0, Math.min(index, segments.length - 1));
    synth().cancel();
    const text = segments[segmentIndex];
    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.volume = volume;
    utterance.onend = () => {
      if (segmentIndex + 1 < segments.length) { segmentIndex += 1; speakSegment(segmentIndex); }
      else { updateStatus('Finished reading this page.'); }
    };
    utterance.onerror = () => updateStatus('Speech playback stopped.');
    synth().speak(utterance);
    updateStatus(`Reading ${segmentIndex + 1} of ${segments.length}.`);
  }

  function playAll() {
    const text = rootText();
    segments = splitText(text);
    if (!segments.length) { updateStatus('There is no readable test content on this page.'); return; }
    const current = synth();
    if (current?.paused && utterance) { current.resume(); updateStatus('Resumed.'); return; }
    speakSegment(0);
  }

  function pause() {
    const current = synth();
    if (!current || !utterance) { updateStatus('Nothing is playing.'); return; }
    if (current.speaking && !current.paused) { current.pause(); updateStatus('Paused.'); }
    else if (current.paused) { current.resume(); updateStatus('Resumed.'); }
  }

  function updateStatus(text) {
    const node = document.getElementById('ttsStatus');
    if (node) node.textContent = text;
  }

  function selectedText(target) {
    const el = target?.closest?.('.source-panel, .question-panel, .azm-test-preview-shell');
    if (!el) return '';
    const selection = window.getSelection?.()?.toString?.().trim() || '';
    return selection;
  }

  function speakClicked(target) {
    if (!clickMode || !synth()) return;
    if (target?.closest?.('#ttsPanel,button,a,input,select,textarea')) return;
    const block = target?.closest?.('p,li,h1,h2,h3,h4,.question-card,.source-title,.choice,.choice-text');
    const text = (selectedText(target) || block?.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    segments = [text];
    speakSegment(0);
  }

  function ensurePanel() {
    let panel = document.getElementById('ttsPanel');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'ttsPanel';
    panel.className = 'overlay-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'ttsTitle');
    panel.innerHTML = `<div class="tts-head panel-head"><span class="tts-title" id="ttsTitle">Text-to-Speech</span><button type="button" class="tts-icon-btn" id="ttsCollapse" aria-expanded="true" aria-label="Collapse Text-to-Speech">−</button><button type="button" class="tts-icon-btn" id="ttsClose" aria-label="Close Text-to-Speech">×</button></div><div class="tts-body"><div class="tts-primary"><button type="button" id="ttsPlay">Play All</button><button type="button" id="ttsPause">Pause</button><button type="button" id="ttsStop">Stop</button></div><div class="tts-click-row"><input type="checkbox" id="ttsClickMode"><label for="ttsClickMode">Click Mode</label><span class="tts-label">(read selected or clicked text)</span></div><div class="tts-row"><span class="tts-label">Speed</span><select id="ttsSpeed" aria-label="Text-to-Speech speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></div><div class="tts-row"><span class="tts-label">Volume</span><input id="ttsVolume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Text-to-Speech volume"></div><p id="ttsStatus" class="tts-status" aria-live="polite">Ready. Text-to-Speech reads the current test page locally.</p></div>`;
    document.body.appendChild(panel);
    panel.querySelector('#ttsPlay').addEventListener('click', playAll);
    panel.querySelector('#ttsPause').addEventListener('click', pause);
    panel.querySelector('#ttsStop').addEventListener('click', () => stopSpeech(true));
    panel.querySelector('#ttsClickMode').addEventListener('change', (e) => { clickMode = e.target.checked; updateStatus(clickMode ? 'Click Mode is on.' : 'Click Mode is off.'); });
    panel.querySelector('#ttsSpeed').addEventListener('change', (e) => { speed = Number(e.target.value) || 1; if (utterance) utterance.rate = speed; });
    panel.querySelector('#ttsVolume').addEventListener('input', (e) => { volume = Number(e.target.value); if (utterance) utterance.volume = volume; });
    panel.querySelector('#ttsCollapse').addEventListener('click', (e) => {
      const collapsed = panel.classList.toggle('azm-tts-collapsed');
      e.currentTarget.setAttribute('aria-expanded', String(!collapsed));
      e.currentTarget.textContent = collapsed ? '+' : '−';
      e.currentTarget.setAttribute('aria-label', collapsed ? 'Expand Text-to-Speech' : 'Collapse Text-to-Speech');
    });
    panel.querySelector('#ttsClose').addEventListener('click', () => { stopSpeech(true); panel.remove(); });
    return panel;
  }

  function open() {
    const panel = ensurePanel();
    panel.hidden = false;
    panel.classList.remove('azm-tts-collapsed');
    panel.querySelector('#ttsPlay')?.focus();
  }

  function installMenuItem() {
    const menu = document.getElementById('toolPopover');
    if (!menu || menu.querySelector('#ttsTool')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'ttsTool';
    button.className = 'tool-item';
    button.innerHTML = icon + '<span>Text-to-Speech</span>';
    button.addEventListener('click', () => { menu.remove(); open(); });
    menu.appendChild(button);
  }

  document.addEventListener('click', (event) => speakClicked(event.target), true);
  const observer = new MutationObserver(() => {
    installMenuItem();
    const state = window.AZAMAN_APP?.getState?.();
    if (state && !['test', 'testPreview'].includes(state.screen)) {
      document.getElementById('ttsPanel')?.remove();
      synth()?.cancel();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  installMenuItem();
  window.AZAMAN_TTS_OPEN = open;
  window.addEventListener('beforeunload', () => synth()?.cancel());
})();