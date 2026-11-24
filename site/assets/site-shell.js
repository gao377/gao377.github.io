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

  // 8. Interactive Diagram Tabs (modern-web-guidance tabs + search-hidden-content)
  function activateDiagramTab(tabsRoot, targetPanelId, focusTab) {
    var tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
    var panels = Array.from(tabsRoot.querySelectorAll('[data-tab-panel]'));
    tabs.forEach(function (tab) {
      var selected = tab.getAttribute('data-tab-panel-id') === targetPanelId;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      if (selected) {
        if (typeof tab.scrollIntoView === 'function') {
          try {
            tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } catch (e) {}
        }
        if (focusTab) tab.focus();
      }
    });
    panels.forEach(function (panel) {
      if (panel.id === targetPanelId) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', 'until-found');
      }
    });
  }

  document.querySelectorAll('[data-diagram-tabs]').forEach(function (tabsRoot) {
    var tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
    var panels = Array.from(tabsRoot.querySelectorAll('[data-tab-panel]'));
    if (!tabs.length || !panels.length) return;

    if (!untilFoundSupported) {
      panels.forEach(function (panel) {
        panel.removeAttribute('hidden');
      });
    }

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        var pid = tab.getAttribute('data-tab-panel-id');
        if (pid) activateDiagramTab(tabsRoot, pid, false);
      });
      tab.addEventListener('keydown', function (e) {
        var nextIdx = -1;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = tabs.length - 1;
        if (nextIdx >= 0) {
          e.preventDefault();
          var nextPid = tabs[nextIdx].getAttribute('data-tab-panel-id');
          if (nextPid) activateDiagramTab(tabsRoot, nextPid, true);
        }
      });
    });

    tabsRoot.addEventListener('beforematch', function (e) {
      var panel = e.target.closest('[data-tab-panel]');
      if (panel && panel.id) {
        activateDiagramTab(tabsRoot, panel.id, false);
      }
    });
  });

  // 9. Interactive Inline SVG Diagrams + Edge Highlight + Filter + Drawers
  function wireSvgInteractions(svg, onNodeToggle, onNodeHover) {
    var nodes = Array.from(svg.querySelectorAll('.arch-node[data-node-id]'));
    var edges = Array.from(svg.querySelectorAll('.arch-edge'));
    var nodeCards = Array.from(svg.querySelectorAll('.arch-node-card[data-node-id]'));

    function setHighlight(activeId) {
      if (!activeId) {
        svg.classList.remove('has-node-highlight');
        nodeCards.forEach(function (card) {
          card.classList.remove('is-highlighted', 'is-neighbor');
        });
        edges.forEach(function (edge) {
          edge.classList.remove('is-highlighted');
        });
        if (onNodeHover) onNodeHover(null);
        return;
      }
      var neighbors = new Set();
      edges.forEach(function (edge) {
        var from = edge.getAttribute('data-from');
        var to = edge.getAttribute('data-to');
        var connected = from === activeId || to === activeId;
        edge.classList.toggle('is-highlighted', connected);
        if (connected) {
          if (from && from !== activeId) neighbors.add(from);
          if (to && to !== activeId) neighbors.add(to);
        }
      });
      svg.classList.add('has-node-highlight');
      nodeCards.forEach(function (card) {
        var cid = card.getAttribute('data-node-id');
        card.classList.toggle('is-highlighted', cid === activeId);
        card.classList.toggle('is-neighbor', neighbors.has(cid));
      });
      if (onNodeHover) onNodeHover(activeId);
    }

    nodes.forEach(function (node) {
      var nid = node.getAttribute('data-node-id');
      node.addEventListener('click', function () {
        onNodeToggle(node, nid);
      });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onNodeToggle(node, nid);
        } else if (e.key === ' ') {
          e.preventDefault();
        }
      });
      node.addEventListener('keyup', function (e) {
        if (e.key === ' ') {
          e.preventDefault();
          onNodeToggle(node, nid);
        }
      });
      node.addEventListener('mouseenter', function () {
        setHighlight(nid);
      });
      node.addEventListener('mouseleave', function () {
        setHighlight(null);
      });
      node.addEventListener('focus', function () {
        setHighlight(nid);
      });
      node.addEventListener('blur', function () {
        setHighlight(null);
      });
    });
  }

  function openNodeDrawer(fig, nodeId, shouldToggle) {
    var svg = fig.querySelector('.interactive-arch-svg');
    if (!svg) return;
    var targetDrawer = fig.querySelector('[data-node-drawer="' + nodeId + '"]');
    var targetNode = svg.querySelector('.arch-node[data-node-id="' + nodeId + '"]');
    var hintEl = fig.querySelector('[data-diagram-hint]');
    var currentlyOpen = targetDrawer && !targetDrawer.hasAttribute('hidden');
    var nextOpen = shouldToggle ? !currentlyOpen : true;

    fig.querySelectorAll('[data-node-drawer]').forEach(function (drawer) {
      if (nextOpen && drawer === targetDrawer) {
        drawer.removeAttribute('hidden');
      } else if (untilFoundSupported) {
        drawer.setAttribute('hidden', 'until-found');
      }
    });
    svg.querySelectorAll('.arch-node[data-node-id]').forEach(function (node) {
      var isThis = nextOpen && node.getAttribute('data-node-id') === nodeId;
      node.setAttribute('aria-expanded', isThis ? 'true' : 'false');
      node.classList.toggle('is-selected', isThis);
      var card = node.closest('.arch-node-card');
      if (card) card.classList.toggle('is-selected', isThis);
    });
    if (hintEl) {
      if (nextOpen && targetNode) {
        hintEl.textContent = '已展开：' + (targetNode.getAttribute('aria-label') || nodeId);
      } else {
        hintEl.textContent = '点击任意模块卡片查看源码路径与契约，或按 Enter / Space 展开';
      }
    }
  }

  document.querySelectorAll('figure.diagram-figure').forEach(function (fig) {
    var svg = fig.querySelector('.interactive-arch-svg');
    if (!svg) return;
    var hintEl = fig.querySelector('[data-diagram-hint]');
    var defaultHint = hintEl ? hintEl.textContent : '';

    if (!untilFoundSupported) {
      fig.querySelectorAll('[data-node-drawer]').forEach(function (drawer) {
        drawer.removeAttribute('hidden');
      });
    }

    wireSvgInteractions(
      svg,
      function (_node, nid) {
        openNodeDrawer(fig, nid, true);
      },
      function (hoverId) {
        if (!hintEl) return;
        if (hoverId) {
          var hNode = svg.querySelector('.arch-node[data-node-id="' + hoverId + '"]');
          if (hNode) hintEl.textContent = hNode.getAttribute('aria-label') || hoverId;
        } else {
          var selected = svg.querySelector('.arch-node.is-selected');
          hintEl.textContent = selected
            ? '已展开：' + (selected.getAttribute('aria-label') || '')
            : defaultHint;
        }
      }
    );

    fig.querySelectorAll('[data-flow-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var flow = btn.getAttribute('data-flow-filter') || 'all';
        fig.querySelectorAll('[data-flow-filter]').forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        svg.querySelectorAll('.arch-edge').forEach(function (edge) {
          var edgeFlows = (edge.getAttribute('data-flow') || 'all').split(',').map(function (s) {
            return s.trim();
          });
          var match = flow === 'all' || edgeFlows.indexOf(flow) >= 0;
          edge.classList.toggle('is-dimmed', !match);
        });
        svg.querySelectorAll('.arch-node-card').forEach(function (card) {
          var node = card.querySelector('.arch-node');
          var nFlows = ((node && node.getAttribute('data-flows')) || 'all').split(',').map(function (s) {
            return s.trim();
          });
          var match = flow === 'all' || nFlows.indexOf(flow) >= 0;
          card.classList.toggle('is-dimmed', !match);
        });
      });
    });

    fig.querySelectorAll('[data-drawer-close]').forEach(function (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var drawer = closeBtn.closest('[data-node-drawer]');
        var nid = drawer && drawer.getAttribute('data-node-drawer');
        if (nid) openNodeDrawer(fig, nid, true);
      });
    });

    fig.querySelectorAll('[data-subview-target]').forEach(function (subBtn) {
      subBtn.addEventListener('click', function () {
        var targetStem = subBtn.getAttribute('data-subview-target');
        if (!targetStem) return;
        var targetFig = document.querySelector('figure.diagram-figure[data-diagram-id="' + targetStem + '"]');
        if (!targetFig) return;
        var tabPanel = targetFig.closest('[data-tab-panel]');
        var tabsRoot = tabPanel && tabPanel.closest('[data-diagram-tabs]');
        if (tabsRoot && tabPanel && tabPanel.id) {
          activateDiagramTab(tabsRoot, tabPanel.id, false);
        }
        targetFig.scrollIntoView({ behavior: reducedMotionQuery && reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
      });
    });

    fig.addEventListener('beforematch', function (e) {
      var drawer = e.target.closest('[data-node-drawer]');
      if (drawer) {
        var nid = drawer.getAttribute('data-node-drawer');
        if (nid) openNodeDrawer(fig, nid, false);
      }
    });
  });

  // 10. Interactive Diagram Lightbox (<dialog closedby="any"> + fallback)
  var lightbox = document.getElementById('diagram-lightbox');
  var lightboxStage = document.getElementById('diagram-lightbox-stage');
  var lightboxDetail = document.getElementById('diagram-lightbox-detail');
  var lightboxTitle = document.getElementById('diagram-lightbox-title');
  var lightboxCloseBtn = lightbox && lightbox.querySelector('[data-lightbox-close]');

  function cloneSvgWithModalSuffix(svg) {
    var clone = svg.cloneNode(true);
    var idMap = {};
    clone.querySelectorAll('[id]').forEach(function (el) {
      var oldId = el.getAttribute('id');
      var newId = oldId + '-modal';
      idMap[oldId] = newId;
      el.setAttribute('id', newId);
    });
    ['aria-labelledby', 'aria-describedby'].forEach(function (attr) {
      var val = clone.getAttribute(attr);
      if (val && idMap[val]) clone.setAttribute(attr, idMap[val]);
    });
    var xml = clone.outerHTML;
    Object.keys(idMap).forEach(function (oldId) {
      var escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      xml = xml.replace(new RegExp('url\\(#' + escaped + '\\)', 'g'), 'url(#' + idMap[oldId] + ')');
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = xml;
    return wrap.firstElementChild;
  }

  function setLightboxZoom(zoomVal) {
    if (!lightbox) return;
    lightbox.setAttribute('data-zoom', zoomVal);
    lightbox.querySelectorAll('[data-lightbox-zoom]').forEach(function (btn) {
      var active = btn.getAttribute('data-lightbox-zoom') === zoomVal;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
  }

  if (lightbox && lightboxStage && typeof lightbox.showModal === 'function') {
    document.querySelectorAll('[data-diagram-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fig = btn.closest('figure.diagram-figure');
        var svg = fig && fig.querySelector('.interactive-arch-svg');
        if (!svg) return;
        var capSpan = fig.querySelector('figcaption span');
        var title = (capSpan && capSpan.textContent.trim()) || '架构矢量图预览';
        if (lightboxTitle) lightboxTitle.textContent = title;
        lightboxStage.innerHTML = '';
        if (lightboxDetail) {
          lightboxDetail.innerHTML = '';
          lightboxDetail.hidden = true;
        }
        var modalSvg = cloneSvgWithModalSuffix(svg);
        if (!modalSvg) return;
        lightboxStage.appendChild(modalSvg);
        wireSvgInteractions(
          modalSvg,
          function (node, nid) {
            modalSvg.querySelectorAll('.arch-node').forEach(function (n) {
              var isThis = n === node;
              n.setAttribute('aria-expanded', isThis ? 'true' : 'false');
              n.classList.toggle('is-selected', isThis);
            });
            var srcCard = fig.querySelector('[data-node-drawer="' + nid + '"] .diagram-drawer-card');
            if (lightboxDetail && srcCard) {
              lightboxDetail.innerHTML = '';
              var cardClone = srcCard.cloneNode(true);
              var closeInside = cardClone.querySelector('[data-drawer-close]');
              if (closeInside) closeInside.remove();
              lightboxDetail.appendChild(cardClone);
              lightboxDetail.hidden = false;
            }
          },
          null
        );
        setLightboxZoom('fit');
        lightbox.showModal();
      });
    });

    lightbox.querySelectorAll('[data-lightbox-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLightboxZoom(btn.getAttribute('data-lightbox-zoom') || 'fit');
      });
    });

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', function () {
        lightbox.close();
      });
    }

    lightbox.addEventListener('close', function () {
      lightbox.returnValue = '';
      setLightboxZoom('fit');
      lightboxStage.innerHTML = '';
      if (lightboxDetail) {
        lightboxDetail.innerHTML = '';
        lightboxDetail.hidden = true;
      }
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      var isOutsideDialog = function (e, dlg) {
        var r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      var pressedOutside = false;
      lightbox.addEventListener('pointerdown', function (e) {
        pressedOutside = isOutsideDialog(e, lightbox);
      });
      lightbox.addEventListener('pointerup', function (e) {
        if (pressedOutside && isOutsideDialog(e, lightbox)) {
          lightbox.close();
        }
        pressedOutside = false;
      });
    }
  }
})();
