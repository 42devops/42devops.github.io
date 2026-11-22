document.addEventListener('DOMContentLoaded', function() {
  // 1. Theme Switcher (syncs localStorage, theme-color meta, and Utterances)
  var toggleBtn = document.getElementById('theme-toggle');
  var themeIconContainer = document.getElementById('theme-icon-container');
  var themeLabel = document.getElementById('theme-label');
  var themeColorMeta = document.getElementById('theme-color-meta');

  var sunSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var moonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  function syncUtterancesTheme(theme) {
    var iframe = document.querySelector('iframe.utterances-frame');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'set-theme',
          theme: theme === 'dark' ? 'github-dark' : 'github-light'
        },
        'https://utteranc.es'
      );
    }
  }

  function updateThemeUI(theme) {
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#111110' : '#FAF9F6');
    }
    if (!toggleBtn) return;
    if (theme === 'dark') {
      if (themeIconContainer) themeIconContainer.innerHTML = sunSVG;
      if (themeLabel) themeLabel.textContent = 'light';
    } else {
      if (themeIconContainer) themeIconContainer.innerHTML = moonSVG;
      if (themeLabel) themeLabel.textContent = 'dark';
    }
  }

  var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      var activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      var newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('42devops-theme', newTheme);
      } catch (e) {}
      updateThemeUI(newTheme);
      syncUtterancesTheme(newTheme);
    });
  }

  // 2. Code Block Enhancement: Language Label + Tactile Copy Button
  var copyIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
  var checkIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function detectLanguage(block) {
    var sources = [
      block,
      block.closest('[class*="language-"]'),
      block.querySelector('code[data-lang]'),
      block.querySelector('code[class*="language-"]')
    ];
    for (var i = 0; i < sources.length; i++) {
      var el = sources[i];
      if (!el) continue;
      if (el.dataset && el.dataset.lang) return el.dataset.lang;
      var match = (el.className || '').match(/language-([a-z0-9_+-]+)/i);
      if (match && match[1] && match[1] !== 'plaintext') {
        return match[1].toLowerCase();
      }
    }
    return 'code';
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  var codeTargets = document.querySelectorAll('.post-content div.highlighter-rouge, .post-content figure.highlight, .post-content > pre');
  codeTargets.forEach(function(block) {
    if (block.closest('.code-wrapper')) return;

    var lang = detectLanguage(block);
    var wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';

    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    var langSpan = document.createElement('span');
    langSpan.className = 'code-lang';
    langSpan.textContent = lang;

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = copyIconSVG + '<span>copy</span>';

    copyBtn.addEventListener('click', function() {
      var codeEl = block.querySelector('code');
      var codeText = codeEl ? codeEl.innerText : block.innerText;
      copyTextToClipboard(codeText).then(function() {
        copyBtn.innerHTML = checkIconSVG + '<span>copied</span>';
        copyBtn.classList.add('copied');
        setTimeout(function() {
          copyBtn.innerHTML = copyIconSVG + '<span>copy</span>';
          copyBtn.classList.remove('copied');
        }, 1800);
      });
    });

    toolbar.appendChild(langSpan);
    toolbar.appendChild(copyBtn);

    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(block);
  });

  // 3. Homepage Category Filters (scoped to #posts-container + year-group syncing)
  var postsContainer = document.getElementById('posts-container');
  var filterPills = document.querySelectorAll('#category-filters .filter-pill');
  var postCountEl = document.getElementById('post-count');

  if (postsContainer && filterPills.length > 0) {
    var postItems = postsContainer.querySelectorAll('.post-list-item');
    var yearGroups = postsContainer.querySelectorAll('.year-group');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function applyFilter(filter, updateUrl) {
      var normalized = (filter || 'all').toLowerCase();
      var hasMatchingPill = false;

      filterPills.forEach(function(pill) {
        var isActive = pill.getAttribute('data-filter') === normalized;
        if (isActive) hasMatchingPill = true;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (!hasMatchingPill) {
        normalized = 'all';
        filterPills.forEach(function(pill) {
          var isAll = pill.getAttribute('data-filter') === 'all';
          pill.classList.toggle('active', isAll);
          pill.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
      }

      var visibleCount = 0;
      var lastVisibleGroup = null;

      yearGroups.forEach(function(group) {
        group.classList.remove('is-last-visible');
        var groupItems = group.querySelectorAll('.post-list-item');
        var groupVisible = 0;

        groupItems.forEach(function(item) {
          var cats = (item.getAttribute('data-categories') || '').trim().split(/\s+/).filter(Boolean);
          var matches = normalized === 'all' || cats.indexOf(normalized) !== -1;

          if (matches) {
            groupVisible++;
            visibleCount++;
            item.style.display = '';
            if (!reducedMotion) {
              void item.offsetWidth;
            }
            item.classList.remove('hidden-card');
          } else {
            item.classList.add('hidden-card');
            if (reducedMotion) {
              item.style.display = 'none';
            } else {
              setTimeout(function() {
                if (item.classList.contains('hidden-card')) {
                  item.style.display = 'none';
                }
              }, 160);
            }
          }
        });

        if (groupVisible > 0) {
          group.classList.remove('is-empty');
          lastVisibleGroup = group;
        } else if (reducedMotion) {
          group.classList.add('is-empty');
        } else {
          setTimeout(function() {
            var stillHidden = Array.prototype.every.call(groupItems, function(el) {
              return el.classList.contains('hidden-card');
            });
            if (stillHidden) {
              group.classList.add('is-empty');
            }
          }, 160);
        }
      });

      if (lastVisibleGroup) {
        lastVisibleGroup.classList.add('is-last-visible');
      }

      if (postCountEl) {
        postCountEl.textContent = String(visibleCount);
      }

      if (updateUrl && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (normalized === 'all') {
          url.searchParams.delete('tag');
        } else {
          url.searchParams.set('tag', normalized);
        }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }

    filterPills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        applyFilter(this.getAttribute('data-filter'), true);
      });
    });

    // Click inline #tags inside archive list to filter
    postsContainer.querySelectorAll('.tag-badge[data-filter-tag]').forEach(function(tagBtn) {
      tagBtn.addEventListener('click', function(e) {
        e.preventDefault();
        applyFilter(this.getAttribute('data-filter-tag'), true);
      });
    });

    // Honor ?tag=<category> on initial load
    var params = new URLSearchParams(window.location.search);
    var initialTag = params.get('tag');
    if (initialTag) {
      applyFilter(initialTag, false);
    }
  }

  // 4. Reading Progress Hairline on Article Pages
  var progressWrap = document.getElementById('reading-progress');
  var progressBar = document.getElementById('reading-progress-bar');
  var postContent = document.getElementById('post-content');

  if (progressWrap && progressBar && postContent) {
    var progressTicking = false;

    function updateProgress() {
      progressTicking = false;
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var contentTop = postContent.getBoundingClientRect().top + scrollTop;
      var contentBottom = contentTop + postContent.offsetHeight;
      var totalReadable = Math.max(1, contentBottom - window.innerHeight * 0.65);
      var ratio = Math.min(1, Math.max(0, scrollTop / totalReadable));

      progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      progressWrap.classList.toggle('is-visible', scrollTop > 64);
    }

    window.addEventListener('scroll', function() {
      if (!progressTicking) {
        progressTicking = true;
        requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  // 5. Back to Top Link
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: reduced ? 'auto' : 'smooth'
      });
    });
  }
});
