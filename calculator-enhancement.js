(() => {
  'use strict';

  const DEG = Math.PI / 180;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const tanDegrees = (value) => {
    const radians = value * DEG;
    if (Math.abs(Math.cos(radians)) < 1e-12) throw new Error('tan undefined');
    return Math.tan(radians);
  };

  function tokenize(input) {
    let x = input
      .replace(/[×·]/g, '*').replace(/[÷]/g, '/')
      .replace(/[−–]/g, '-')
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt')
      .replace(/\s+/g, '')
      .replace(/\^/g, '^');
    x = x.replace(/(\d|\))(?=(?:[A-Za-z]+|\())/g, '$1*');
    x = x.replace(/(pi|e|\))(?=(?:\d|\())/g, '$1*');
    return x;
  }

  function evaluate(input) {
    const x = tokenize(input);
    if (!x) throw new Error('empty');
    if (!/^[0-9a-zA-Z_+\-*/().,^]+$/.test(x)) throw new Error('characters');

    const names = new Map([
      ['pi', Math.PI], ['e', Math.E],
      ['sin', (v) => Math.sin(v * DEG)], ['cos', (v) => Math.cos(v * DEG)],
      ['tan', tanDegrees],
      ['asin', (v) => Math.asin(v) / DEG], ['acos', (v) => Math.acos(v) / DEG],
      ['atan', (v) => Math.atan(v) / DEG],
      ['sqrt', Math.sqrt], ['abs', Math.abs], ['ln', Math.log],
      ['log', Math.log10], ['exp', Math.exp],
    ]);

    let pos = 0;
    const rest = () => x.slice(pos);
    const eat = (re) => {
      const match = rest().match(re);
      if (!match) return null;
      pos += match[0].length;
      return match[0];
    };
    const primary = () => {
      if (eat(/^\(/)) {
        const value = expression();
        if (!eat(/^\)/)) throw new Error('paren');
        return value;
      }
      const name = eat(/^[A-Za-z]+/);
      if (name) {
        if (name === 'pi' || name === 'e') return names.get(name);
        const fn = names.get(name);
        if (!fn || typeof fn !== 'function' || !eat(/^\(/)) throw new Error('fn');
        const value = expression();
        if (!eat(/^\)/)) throw new Error('paren');
        return fn(value);
      }
      const num = eat(/^\d+(?:\.\d*)?|^\.\d+/);
      if (!num) throw new Error('number');
      return Number(num);
    };
    const power = () => {
      const base = primary();
      return eat(/^\^/) ? Math.pow(base, unary()) : base;
    };
    const unary = () => {
      if (eat(/^\+/)) return unary();
      if (eat(/^-/)) return -unary();
      return power();
    };
    const term = () => {
      let value = unary();
      for (;;) {
        if (eat(/^\*/)) value *= unary();
        else if (eat(/^\//)) value /= unary();
        else break;
      }
      return value;
    };
    function expression() {
      let value = term();
      for (;;) {
        if (eat(/^\+/)) value += term();
        else if (eat(/^-/)) value -= term();
        else break;
      }
      return value;
    }
    const result = expression();
    if (pos !== x.length || !Number.isFinite(result)) throw new Error('invalid');
    return result;
  }

  function graphExpression(input, x) {
    // Substitute the variable at letter-run level: \bx\b never matches '2x'
    // (no word boundary between digit and letter), and a plain /x/g would
    // corrupt function names like 'exp'. Only runs that are exactly 'x'
    // are the variable; everything else (sin, cos, exp, pi, ...) is kept.
    const substituted = input.replace(/[A-Za-z]+/g, (name) => (name.toLowerCase() === 'x' ? `(${x})` : name));
    return evaluate(substituted);
  }

  function install(panel) {
    if (!panel || panel.dataset.azmCalcReady === '1') return;
    panel.dataset.azmCalcReady = '1';
    const head = panel.querySelector('.panel-head');
    const close = panel.querySelector('#closeCalc');
    // The calculator enhancement replaces the panel body. Reset the tool-layer
    // enhancement flags so its observer can rebind the new header/resize handle.
    panel.dataset.resizeReady = '0';
    panel.dataset.focusReady = '0';
    panel.innerHTML = `${head?.outerHTML || '<div class="panel-head"><b>Calculator</b></div>'}
      <div class="azm-calc-tabs" role="tablist" aria-label="Calculator modes">
        <button type="button" class="azm-calc-tab active" data-mode="calculate" role="tab" aria-selected="true" aria-controls="azmCalcCalculate">Calculate</button>
        <button type="button" class="azm-calc-tab" data-mode="graph" role="tab" aria-selected="false" aria-controls="azmCalcGraph">Graph</button>
      </div>
      <section id="azmCalcCalculate" data-calc-view="calculate" role="tabpanel">
        <input id="calcDisplay" class="calc-display mono" aria-label="Calculator expression" autocomplete="off" inputmode="decimal">
        <div class="azm-calc-memory" aria-label="Calculator shortcuts">
          <button type="button" data-insert="sin(">sin</button><button type="button" data-insert="cos(">cos</button><button type="button" data-insert="tan(">tan</button><button type="button" data-insert="sqrt(">√</button><button type="button" data-insert="^">xʸ</button><button type="button" data-insert="pi">π</button>
        </div>
        <div class="calc-grid">${['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','(',')','+','⌫','=','C'].map(v => `<button class="calc-key" type="button" data-calc="${v}">${v}</button>`).join('')}</div>
        <p class="small azm-calc-help">Angles use degrees. Supported functions include sin, cos, tan, inverse trig, √, abs, ln, log, exp, π and e. Implicit multiplication such as 2x, 2π, and 2(x+1) is supported.</p>
      </section>
      <section id="azmCalcGraph" data-calc-view="graph" role="tabpanel" hidden>
        <label class="small" for="azmGraphExpr">Function</label>
        <input id="azmGraphExpr" class="text-input mono" value="sin(x)" aria-label="Graph function" spellcheck="false">
        <div class="azm-graph-controls"><label class="small">X min <input id="azmXMin" class="text-input" value="-10" inputmode="decimal"></label><label class="small">X max <input id="azmXMax" class="text-input" value="10" inputmode="decimal"></label><button id="azmPlot" type="button" class="btn primary-action">Plot</button></div>
        <canvas id="azmGraph" class="azm-graph" width="700" height="420" aria-label="Function graph"></canvas>
        <p id="azmGraphStatus" class="small" aria-live="polite">Enter a function in x and choose Plot.</p>
      </section>`;

    panel.querySelector('#closeCalc')?.addEventListener('click', () => panel.remove());
    const views = { calculate: panel.querySelector('#azmCalcCalculate'), graph: panel.querySelector('#azmCalcGraph') };
    panel.querySelectorAll('.azm-calc-tab').forEach((tab) => tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      panel.querySelectorAll('.azm-calc-tab').forEach((item) => {
        const active = item.dataset.mode === mode;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      Object.entries(views).forEach(([name, view]) => { if (view) view.hidden = name !== mode; });
      (mode === 'graph' ? panel.querySelector('#azmGraphExpr') : panel.querySelector('#calcDisplay'))?.focus();
    }));

    const display = panel.querySelector('#calcDisplay');
    let expression = '';
    const setDisplay = () => { display.value = expression; };
    panel.querySelectorAll('[data-insert]').forEach((button) => button.addEventListener('click', () => {
      expression = expression === 'Error' ? button.dataset.insert : expression + button.dataset.insert;
      setDisplay(); display.focus();
    }));
    panel.querySelectorAll('[data-calc]').forEach((button) => button.addEventListener('click', () => {
      const value = button.dataset.calc;
      if (value === 'C') expression = '';
      else if (value === '⌫') expression = expression.slice(0, -1);
      else if (value === '=') { try { expression = String(evaluate(expression)); } catch (_) { expression = 'Error'; } }
      else expression = expression === 'Error' ? value : expression + value;
      setDisplay(); display.focus();
    }));
    display.addEventListener('input', () => { expression = display.value; });
    display.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); expression = display.value;
        try { expression = String(evaluate(expression)); } catch (_) { expression = 'Error'; }
        setDisplay();
      } else if (event.key === 'Escape') { event.preventDefault(); close.click(); }
    });

    const graphCanvas = panel.querySelector('#azmGraph');
    const ctx = graphCanvas.getContext('2d');
    const status = panel.querySelector('#azmGraphStatus');
    function plot() {
      const xmin = Number(panel.querySelector('#azmXMin').value);
      const xmax = Number(panel.querySelector('#azmXMax').value);
      const fn = panel.querySelector('#azmGraphExpr').value.trim();
      if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmax <= xmin || xmax - xmin > 200 || !fn) { status.textContent = 'Use a valid X range (maximum span 200).'; return; }
      const w = graphCanvas.width;
      const h = graphCanvas.height;
      const yMin = -10;
      const yMax = 10;
      const pxY = (y) => h - (y - yMin) / (yMax - yMin) * h;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#d7dce1';
      ctx.beginPath();
      const zeroX = xmin <= 0 && xmax >= 0 ? (0 - xmin) / (xmax - xmin) * w : null;
      const zeroY = pxY(0);
      if (zeroX !== null) { ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, h); }
      ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();
      ctx.strokeStyle = '#18212a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let drawing = false;
      let good = 0;
      for (let i = 0; i < w; i += 2) {
        const x = xmin + (xmax - xmin) * i / (w - 1);
        let y;
        try { y = graphExpression(fn, x); } catch (_) { y = NaN; }
        if (!Number.isFinite(y) || Math.abs(y) > 1000) { drawing = false; continue; }
        const py = pxY(clamp(y, yMin, yMax));
        if (!drawing) ctx.moveTo(i, py); else ctx.lineTo(i, py);
        drawing = true;
        good += 1;
      }
      ctx.stroke();
      status.textContent = good ? `Plotted ${fn} for x from ${xmin} to ${xmax}. Y-axis shown from −10 to 10.` : 'The function could not be plotted in this range.';
    }
    panel.querySelector('#azmPlot').addEventListener('click', plot);
    panel.querySelector('#azmGraphExpr').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); plot(); } });
    document.dispatchEvent(new CustomEvent('azm-calculator-ready'));
    setDisplay();
    display.focus();
  }

  const observer = new MutationObserver(() => install(document.getElementById('calculatorPanel')));
  observer.observe(document.body, { childList: true, subtree: true });
  install(document.getElementById('calculatorPanel'));
})();
