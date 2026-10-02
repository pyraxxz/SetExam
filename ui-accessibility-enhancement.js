(() => {
  'use strict';

  function enhanceChoices(root = document) {
    root.querySelectorAll('.choices').forEach((group) => {
      group.querySelectorAll('.choice').forEach((button) => {
        const selected = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(selected));
      });
    });
  }

  function enhanceReview(modal) {
    if (!modal || modal.dataset.a11yReady === '1') return;
    modal.dataset.a11yReady = '1';
    const title = modal.querySelector('.modal-head h3');
    if (title) {
      title.id = title.id || 'reviewDialogTitle';
      modal.setAttribute('aria-labelledby', title.id);
    }
    modal.querySelector('#closeReview')?.setAttribute('aria-label', 'Close question review');
    modal.querySelector('#closeReview2')?.setAttribute('aria-label', 'Return to current question');
    modal.querySelector('#submitModule')?.setAttribute('aria-label', 'Finish this module');
    modal.querySelectorAll('.review-q').forEach((button) => {
      const number = button.textContent.trim();
      const states = [button.classList.contains('answered') ? 'answered' : 'unanswered'];
      if (button.classList.contains('marked')) states.push('marked for review');
      if (button.classList.contains('current')) states.push('current question');
      button.setAttribute('aria-label', `Question ${number}, ${states.join(', ')}`);
      button.setAttribute('aria-current', button.classList.contains('current') ? 'page' : 'false');
    });
    modal.querySelector('#goReviewPage')?.setAttribute('aria-label', 'Go to the first unanswered or marked question');
  }

  function enhanceTools(popover) {
    if (!popover || popover.dataset.a11yReady === '1') return;
    popover.dataset.a11yReady = '1';
    popover.setAttribute('role', 'menu');
    const title = popover.querySelector('.tool-head b');
    if (title) {
      title.id = title.id || 'toolMenuTitle';
      popover.setAttribute('aria-labelledby', title.id);
    } else {
      popover.setAttribute('aria-label', 'Test tools');
    }
    popover.querySelector('#closeTools')?.setAttribute('aria-label', 'Close test tools');
    popover.querySelectorAll('.tool-item').forEach((item) => item.setAttribute('role', 'menuitem'));
  }

  function enhanceExamRegions() {
    const top = document.querySelector('.test-top');
    if (top) {
      top.setAttribute('role', 'banner');
      top.setAttribute('aria-label', 'Bluebook Controls');
    }

    const timer = document.getElementById('timer');
    if (timer) {
      timer.setAttribute('role', 'timer');
      timer.setAttribute('aria-label', 'Test timer');
      // Timer ticks should not interrupt a screen reader every quarter-second.
      timer.setAttribute('aria-live', 'off');
      timer.setAttribute('aria-atomic', 'true');
    }

    const source = document.querySelector('.source-panel');
    if (source) {
      source.setAttribute('role', 'region');
      source.setAttribute('aria-label', 'Passage or Source');
    }

    const question = document.querySelector('.question-panel');
    if (question) {
      question.setAttribute('role', 'region');
      question.setAttribute('aria-label', 'Question and Answer');
    }

    const footer = document.querySelector('.test-footer');
    if (footer) {
      footer.setAttribute('role', 'contentinfo');
      footer.setAttribute('aria-label', 'Question Navigation');
    }
  }

  function enhanceNavigation() {
    enhanceExamRegions();

    const mark = document.getElementById('markBtn');
    if (mark) {
      const marked = /^Unmark\b/i.test(mark.textContent.trim());
      mark.setAttribute('aria-pressed', String(marked));
      mark.setAttribute('aria-label', marked ? 'Remove mark for review' : 'Mark for review');
    }
    const tools = document.getElementById('toolsBtn');
    const popover = document.getElementById('toolPopover');
    if (tools) {
      tools.setAttribute('aria-haspopup', 'menu');
      tools.setAttribute('aria-expanded', String(!!popover && popover.getClientRects().length > 0));
      tools.setAttribute('aria-label', 'Test tools');
    }
    const review = document.getElementById('reviewBtn');
    const modal = document.getElementById('reviewModal');
    if (review) {
      review.setAttribute('aria-haspopup', 'dialog');
      review.setAttribute('aria-expanded', String(!!modal && modal.getClientRects().length > 0));
      review.setAttribute('aria-label', 'Open question menu');
    }
    document.getElementById('prevBtn')?.setAttribute('aria-label', 'Previous question');
    document.getElementById('nextBtn')?.setAttribute('aria-label', /Review module/i.test(document.getElementById('nextBtn')?.textContent || '') ? 'Review module' : 'Next question');
  }

  function enhanceSourceTables() {
    document.querySelectorAll('.source-panel .data-table table').forEach((table, index) => {
      const heading = table.closest('.data-table')?.previousElementSibling;
      const titleText = heading?.classList?.contains('source-title') ? heading.textContent.trim() : '';
      if (!table.querySelector('caption')) {
        const caption = document.createElement('caption');
        caption.className = 'visually-hidden';
        caption.textContent = titleText || `Source data table ${index + 1}`;
        table.insertBefore(caption, table.firstChild);
      }
      table.querySelectorAll('thead th').forEach((th) => th.setAttribute('scope', 'col'));
      table.querySelectorAll('tbody th').forEach((th) => th.setAttribute('scope', 'row'));
      table.setAttribute('aria-label', table.querySelector('caption')?.textContent || `Source data table ${index + 1}`);
    });
  }

  function enhanceBreakTimer() {
    const clock = document.getElementById('breakClock');
    if (!clock) return;
    clock.setAttribute('role', 'timer');
    clock.setAttribute('aria-label', 'Break time remaining');
    clock.setAttribute('aria-atomic', 'true');
    clock.setAttribute('aria-live', 'off');
  }

  function enhanceStartCode(root = document) {
    const fields = [...root.querySelectorAll('.start-digit')];
    fields.forEach((field, index) => {
      field.setAttribute('aria-label', `Start code digit ${index + 1} of ${fields.length || 6}`);
      field.setAttribute('aria-posinset', String(index + 1));
      field.setAttribute('aria-setsize', String(fields.length || 6));
    });
  }

  function installReducedMotionSupport() {
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (document.getElementById('azmReducedMotion')) return;
    const style = document.createElement('style');
    style.id = 'azmReducedMotion';
    style.textContent = '*,:before,:after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}';
    document.head.appendChild(style);
  }

  function enhance() {
    enhanceChoices();
    enhanceReview(document.getElementById('reviewModal'));
    enhanceTools(document.getElementById('toolPopover'));
    enhanceNavigation();
    enhanceSourceTables();
    enhanceBreakTimer();
    enhanceStartCode();
    installReducedMotionSupport();
  }

  // State changes replace DOM subtrees. Watching only child-list mutations keeps
  // accessibility augmentation responsive without observing the attributes it edits.
  const observer = new MutationObserver(enhance);
  observer.observe(document.body, { childList: true, subtree: true });
  enhance();
})();
