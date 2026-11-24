/* FACRI Site Shell Runtime — Pure Vanilla ES6 (No dependencies) */
(function () {
  'use strict';

  // 1. Optional Color-Scheme Override (auto -> light -> dark)
  var THEME_KEY = 'facri_docs_color_scheme';
  var root = document.documentElement;
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var THEME_MODES = ['auto', 'light', 'dark'];
  var THEME_LABELS = { auto: '主题: 自动', light: '主题: 浅色', dark: '主题: 深色' };

  function applyScheme(mode) {
    var val = THEME_MODES.indexOf(mode) >= 0 ? mode : 'auto';
    if (val === 'auto') {
      root.style.removeProperty('color-scheme');
      root.removeAttribute('data-theme');
    } else {
      root.style.colorScheme = val;
      root.setAttribute('data-theme', val);
    }
    if (themeBtn) {
      themeBtn.textContent = THEME_LABELS[val];
      themeBtn.setAttribute('data-scheme', val);
    }
  }

  try {
    applyScheme(localStorage.getItem(THEME_KEY) || 'auto');
  } catch (e) {
    applyScheme('auto');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var curr = themeBtn.getAttribute('data-scheme') || 'auto';
      var next = THEME_MODES[(THEME_MODES.indexOf(curr) + 1) % THEME_MODES.length];
      applyScheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  }

  // 2. Responsive Navbar Measurement + Popover Attribute Sync (modern-web-guidance navbar)
  var header = document.querySelector('.site-header');
  var headerInner = header && header.querySelector('.header-inner');
  var siteMenu = document.getElementById('site-menu');
  var supportsPopover = Object.hasOwn(HTMLElement.prototype, 'popover');

  if (header && headerInner && siteMenu) {
    var lastWidth = 0;
    var syncNavLayout = function () {
      var wasOpen = supportsPopover && siteMenu.matches(':popover-open');
      header.classList.add('is-measuring');
      header.classList.add('is-wide');
      siteMenu.removeAttribute('popover');
      var fits = headerInner.scrollWidth <= headerInner.clientWidth;
      if (fits) {
        header.classList.add('is-wide');
      } else {
        header.classList.remove('is-wide');
        siteMenu.setAttribute('popover', 'auto');
        if (wasOpen && supportsPopover) {
          try { siteMenu.showPopover(); } catch (e) {}
        }
      }
      requestAnimationFrame(function () {
        header.classList.remove('is-measuring');
      });
    };

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        var w = header.clientWidth;
        if (header.classList.contains('is-wide') || w > lastWidth || lastWidth === 0) {
          lastWidth = w;
          syncNavLayout();
        } else {
          lastWidth = w;
        }
      });
      ro.observe(header);
      ro.observe(siteMenu);
    }
    syncNavLayout();
  }

  // 3. Prefers-Reduced-Motion Video Safety (modern-web-guidance lazy-load-video-and-audio)
  var reducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function syncReducedMotion(reduced) {
    document.querySelectorAll('video[autoplay]').forEach(function (video) {
      if (reduced) {
        video.removeAttribute('autoplay');
        video.pause();
      }
    });
  }
  if (reducedMotionQuery) {
    syncReducedMotion(reducedMotionQuery.matches);
    reducedMotionQuery.addEventListener('change', function (e) {
      syncReducedMotion(e.matches);
    });
  }

  // 4. IntersectionObserver Fallback for <video loading="lazy">
  var supportsLazyMedia = Object.hasOwn(HTMLMediaElement.prototype, 'loading');
  if (!supportsLazyMedia && typeof IntersectionObserver !== 'undefined') {
    var lazyMedia = document.querySelectorAll('video[loading="lazy"]');
    if (lazyMedia.length) {
      var mediaObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var media = entry.target;
          if (media.dataset.poster) {
            media.poster = media.dataset.poster;
            delete media.dataset.poster;
          }
          if (media.dataset.preload) {
            media.preload = media.dataset.preload;
            delete media.dataset.preload;
          }
          media.querySelectorAll('source[data-src]').forEach(function (src) {
            src.src = src.dataset.src;
            delete src.dataset.src;
          });
          media.load();
          observer.unobserve(media);
        });
      }, { rootMargin: '200px 0px' });

      lazyMedia.forEach(function (media) {
        if (media.hasAttribute('poster')) {
          media.dataset.poster = media.getAttribute('poster');
          media.removeAttribute('poster');
        }
        if (media.hasAttribute('preload') && media.getAttribute('preload') !== 'none') {
          media.dataset.preload = media.getAttribute('preload');
        }
        media.querySelectorAll('source[src]').forEach(function (src) {
          src.dataset.src = src.getAttribute('src');
          src.removeAttribute('src');
        });
        media.preload = 'none';
        mediaObserver.observe(media);
      });
    }
  }

  // 5. hidden="until-found" + beforematch Switcher (modern-web-guidance search-hidden-content)
  var untilFoundSupported = 'onbeforematch' in HTMLElement.prototype;
  document.querySelectorAll('[data-until-found-group]').forEach(function (group) {
    var buttons = group.querySelectorAll('[aria-controls]');
    var panels = group.querySelectorAll('[data-switch-panel]');

    function activatePanel(targetId) {
      panels.forEach(function (panel) {
        if (panel.id === targetId) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', 'until-found');
        }
      });
      buttons.forEach(function (btn) {
        var expanded = btn.getAttribute('aria-controls') === targetId;
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        btn.classList.toggle('is-active', expanded);
      });
    }

    if (!untilFoundSupported) {
      // Fallback: display all hidden panels linearly so Ctrl+F and anchor links stay intact.
      panels.forEach(function (panel) {
        panel.removeAttribute('hidden');
      });
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'true');
      });
    } else {
      group.addEventListener('beforematch', function (e) {
        var panel = e.target.closest('[data-switch-panel]');
        if (panel && panel.id) {
          activatePanel(panel.id);
        }
      });
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetId = btn.getAttribute('aria-controls');
          if (targetId) activatePanel(targetId);
        });
      });
    }
  });

  // 6. Code & CLI Copy Buttons
  document.querySelectorAll('.copy-cli-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var codeEl = btn.parentElement && btn.parentElement.querySelector('code');
      if (!codeEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(codeEl.textContent.trim()).then(function () {
        var orig = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = orig; }, 1600);
      });
    });
  });

  document.querySelectorAll('article pre > code').forEach(function (code) {
    var pre = code.parentElement;
    if (!pre || pre.querySelector('.copy-btn') || !navigator.clipboard) return;
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', '复制代码块');
    btn.textContent = '复制';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(code.innerText).then(function () {
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 1600);
      });
    });
    pre.appendChild(btn);
  });

  // 7. Data Labels for Responsive Stacked Tables
  document.querySelectorAll('.table-wrapper table').forEach(function (tbl) {
    var headers = Array.from(tbl.querySelectorAll('thead th')).map(function (th) {
      return th.textContent.trim();
    });
    if (!headers.length) return;
    tbl.classList.add('responsive-stack');
    tbl.querySelectorAll('tbody tr').forEach(function (tr) {
      Array.from(tr.children).forEach(function (cell, idx) {
        if (cell.tagName === 'TD' && headers[idx] && !cell.hasAttribute('data-label')) {
          cell.setAttribute('data-label', headers[idx]);
        }
      });
    });
  });
})();
