/*****************************************************************************/
/* Pretext Rich Note Engine (Theme-Reactive & Bilingual Wrap-Safe)           */
/* Inspired by Cheng Lou's Pretext Rich Note (https://chenglou.me/pretext/)  */
/*****************************************************************************/

(function() {
  function tokenizeText(str) {
    // Split cleanly on spaces while allowing CJK characters to wrap individually
    var tokens = [];
    var raw = String(str || '');
    var re = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]|[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+|\s+/g;
    var match;
    while ((match = re.exec(raw)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  }

  function initRichNotes() {
    var containers = document.querySelectorAll('.pretext-rich-note');
    if (!containers.length) return;

    var renderers = [];

    containers.forEach(function(container) {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      var rawItems = [];
      try {
        rawItems = JSON.parse(container.getAttribute('data-items') || '[]');
      } catch (e) {
        console.error('Invalid data-items JSON in .pretext-rich-note', e);
        return;
      }

      if (!rawItems.length) return;

      var canvas = document.createElement('canvas');
      canvas.className = 'pretext-rich-note-canvas';
      canvas.style.cssText = 'width: 100%; display: block;';
      container.appendChild(canvas);

      var ctx = canvas.getContext('2d');

      function getFont(type) {
        if (type === 'title') {
          return "500 16px 'Source Serif 4', 'Noto Serif SC', Georgia, serif";
        }
        if (type === 'code') {
          return "400 13px 'JetBrains Mono', 'SF Mono', Consolas, monospace";
        }
        if (type === 'chip') {
          return "500 12px 'JetBrains Mono', 'Plus Jakarta Sans', sans-serif";
        }
        return "400 14.5px 'Plus Jakarta Sans', -apple-system, 'PingFang SC', sans-serif";
      }

      function getThemeColors() {
        var style = getComputedStyle(document.documentElement);
        return {
          text: style.getPropertyValue('--text-main').trim() || '#1c1b19',
          muted: style.getPropertyValue('--text-secondary').trim() || '#4a4741',
          accent: style.getPropertyValue('--brand-accent').trim() || '#b84a27',
          accentSoft: style.getPropertyValue('--brand-accent-soft').trim() || 'rgba(184, 74, 39, 0.1)',
          subtle: style.getPropertyValue('--bg-subtle').trim() || '#f2efe9',
          border: style.getPropertyValue('--border-subtle').trim() || '#eeebe4'
        };
      }

      function layoutAndRender() {
        var rect = container.getBoundingClientRect();
        var width = Math.max(240, Math.floor(rect.width || 600));
        var dpr = window.devicePixelRatio || 1;
        var colors = getThemeColors();

        var paddingX = 22;
        var paddingY = 22;
        var lineHeight = 27;
        var availableWidth = Math.max(160, width - paddingX * 2);

        var currentX = paddingX;
        var currentY = paddingY + 14;
        var renderOps = [];

        rawItems.forEach(function(item) {
          var type = typeof item === 'string' ? 'text' : (item.type || 'text');
          var text = typeof item === 'string' ? item : (item.text || '');

          if (type === 'title') {
            if (currentX > paddingX) {
              currentX = paddingX;
              currentY += lineHeight;
            }
            ctx.font = getFont('title');
            var titleTokens = tokenizeText(text);
            var lineStr = '';
            titleTokens.forEach(function(tok) {
              var test = lineStr + tok;
              if (ctx.measureText(test).width > availableWidth && lineStr.trim()) {
                renderOps.push({ type: 'title', text: lineStr.trimEnd(), x: paddingX, y: currentY });
                currentY += 24;
                lineStr = tok.trimStart();
              } else {
                lineStr = test;
              }
            });
            if (lineStr.trim()) {
              renderOps.push({ type: 'title', text: lineStr.trimEnd(), x: paddingX, y: currentY });
            }
            currentX = paddingX;
            currentY += 10;
            renderOps.push({ type: 'rule', x: paddingX, y: currentY, w: availableWidth });
            currentY += 24;
            return;
          }

          if (type === 'chip' || type === 'code') {
            ctx.font = getFont(type);
            var pad = type === 'chip' ? 18 : 14;
            var itemW = ctx.measureText(text).width + pad;
            if (currentX + itemW > paddingX + availableWidth && currentX > paddingX) {
              currentX = paddingX;
              currentY += lineHeight;
            }
            renderOps.push({
              type: type,
              text: text,
              bg: item.bg,
              color: item.color,
              width: itemW,
              x: currentX,
              y: currentY
            });
            currentX += itemW + 6;
            return;
          }

          // Flowing prose text with CJK + Latin line wrapping
          ctx.font = getFont('text');
          var tokens = tokenizeText(text);
          tokens.forEach(function(tok) {
            if (/^\s+$/.test(tok) && currentX === paddingX) return;
            var w = ctx.measureText(tok).width;
            if (currentX + w > paddingX + availableWidth && currentX > paddingX) {
              currentX = paddingX;
              currentY += lineHeight;
              if (/^\s+$/.test(tok)) return;
            }
            renderOps.push({ type: 'text', text: tok, x: currentX, y: currentY });
            currentX += w;
          });
          currentX += 4;
        });

        var calculatedHeight = Math.max(88, Math.ceil(currentY + paddingY));

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(calculatedHeight * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = calculatedHeight + 'px';
        container.style.height = calculatedHeight + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, calculatedHeight);

        // Subtle archival left accent bar
        ctx.fillStyle = colors.accent;
        ctx.fillRect(0, 0, 3, calculatedHeight);

        renderOps.forEach(function(op) {
          if (op.type === 'rule') {
            ctx.fillStyle = colors.border;
            ctx.fillRect(op.x, op.y, op.w, 1);
            return;
          }

          if (op.type === 'title') {
            ctx.font = getFont('title');
            ctx.fillStyle = colors.text;
            ctx.fillText(op.text, op.x, op.y);
            return;
          }

          if (op.type === 'chip') {
            ctx.fillStyle = op.bg || colors.accentSoft;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(op.x, op.y - 14, op.width - 2, 20, 10);
              ctx.fill();
            } else {
              ctx.fillRect(op.x, op.y - 14, op.width - 2, 20);
            }
            ctx.font = getFont('chip');
            ctx.fillStyle = op.color || colors.accent;
            ctx.fillText(op.text, op.x + 8, op.y - 0.5);
            return;
          }

          if (op.type === 'code') {
            ctx.fillStyle = colors.subtle;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(op.x, op.y - 14, op.width - 2, 20, 4);
              ctx.fill();
            } else {
              ctx.fillRect(op.x, op.y - 14, op.width - 2, 20);
            }
            ctx.font = getFont('code');
            ctx.fillStyle = colors.text;
            ctx.fillText(op.text, op.x + 6, op.y - 0.5);
            return;
          }

          ctx.font = getFont('text');
          ctx.fillStyle = colors.muted;
          ctx.fillText(op.text, op.x, op.y);
        });
      }

      renderers.push(layoutAndRender);
      layoutAndRender();
    });

    var resizeRaf = null;
    window.addEventListener('resize', function() {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function() {
        renderers.forEach(function(fn) { fn(); });
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        renderers.forEach(function(fn) { fn(); });
      });
    }

    if (window.MutationObserver) {
      var themeObserver = new MutationObserver(function() {
        renderers.forEach(function(fn) { fn(); });
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initRichNotes);
})();
