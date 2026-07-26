/*****************************************************************************/
/* Pretext Rich Note Engine (Zero-Dragon Component for Articles & Pages)     */
/* Inspired by Cheng Lou's Pretext Rich Note (https://chenglou.me/pretext/)   */
/*****************************************************************************/

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function initRichNotes() {
    const containers = document.querySelectorAll('.pretext-rich-note');
    if (!containers.length) return;

    containers.forEach(container => {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      let rawItems = [];
      try {
        rawItems = JSON.parse(container.getAttribute('data-items') || '[]');
      } catch(e) {
        console.warn('Invalid JSON in data-items for .pretext-rich-note', e);
        return;
      }

      if (!rawItems.length) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'pretext-rich-note-canvas';
      canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let dpr = window.devicePixelRatio || 1;
      let width = 0;
      let height = 0;
      let itemWidths = [];

      function getFont(type = 'text') {
        if (type === 'code') {
          return `13px 'JetBrains Mono', 'Fira Code', Consolas, monospace`;
        }
        if (type === 'chip') {
          return `600 12px 'Plus Jakarta Sans', 'Inter', sans-serif`;
        }
        return `500 14px 'Charter', 'Source Serif 4', 'Noto Serif SC', Georgia, serif`;
      }

      function getItemWidth(item) {
        if (typeof item === 'string') {
          ctx.font = getFont('text');
          return ctx.measureText(item + " ").width;
        }
        if (item.type === 'chip') {
          ctx.font = getFont('chip');
          return ctx.measureText(item.text).width + 20;
        }
        if (item.type === 'code') {
          ctx.font = getFont('code');
          return ctx.measureText(item.text).width + 14;
        }
        ctx.font = getFont('text');
        return ctx.measureText((item.text || '') + " ").width;
      }

      function measureItems() {
        itemWidths = rawItems.map(getItemWidth);
      }

      function resize() {
        const rect = container.getBoundingClientRect();
        width = rect.width || 600;
        height = rect.height || 180;
        dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(dpr, dpr);
        measureItems();
        draw();
      }

      function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
          text: style.getPropertyValue('--text-main').trim() || '#141413',
          brand: style.getPropertyValue('--brand-primary').trim() || '#1B365D',
          subtle: style.getPropertyValue('--border-color').trim() || '#e8e6dc'
        };
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        const colors = getThemeColors();

        // Detect DOM obstacles inside/adjacent to container
        const domObstacles = [];
        const containerRect = container.getBoundingClientRect();
        const obstacleElements = container.querySelectorAll('.pretext-obstacle, img, blockquote, .ann-showcase-card');
        obstacleElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const pad = 10;
          const top = rect.top - containerRect.top - pad;
          const bottom = rect.bottom - containerRect.top + pad;
          const left = rect.left - containerRect.left - pad;
          const right = rect.right - containerRect.left + pad;
          if (right > 0 && left < width && bottom > 0 && top < height) {
            domObstacles.push({ left, right, top, bottom });
          }
        });

        const lineHeight = 26;
        let itemIdx = 0;

        for (let y = 20; y < height; y += lineHeight) {
          let x = 12;

          while (x < width - 12) {
            let availableSpan = width - 12 - x;

            for (let obs of domObstacles) {
              if (y >= obs.top && y <= obs.bottom) {
                if (x < obs.right && x + availableSpan > obs.left) {
                  if (x < obs.left) {
                    availableSpan = obs.left - x;
                  } else {
                    x = obs.right;
                    availableSpan = width - 12 - x;
                  }
                }
              }
            }

            let count = 0;
            let currentSpan = 0;
            let checkIdx = itemIdx;

            while (currentSpan + itemWidths[checkIdx] <= availableSpan) {
              currentSpan += itemWidths[checkIdx];
              count++;
              checkIdx = (checkIdx + 1) % rawItems.length;
              if (count === rawItems.length) break;
            }

            if (count === 0) {
              x += 16;
              continue;
            }

            let renderX = x;
            for (let i = 0; i < count; i++) {
              const item = rawItems[itemIdx];
              const itemW = itemWidths[itemIdx];

              if (typeof item === 'string') {
                ctx.font = getFont('text');
                ctx.fillStyle = colors.text;
                ctx.fillText(item, renderX, y);
              } else if (item.type === 'chip') {
                ctx.fillStyle = item.bg || 'rgba(27, 54, 93, 0.12)';
                if (ctx.roundRect) {
                  ctx.beginPath();
                  ctx.roundRect(renderX, y - 14, itemW - 4, 18, 9);
                  ctx.fill();
                } else {
                  ctx.fillRect(renderX, y - 14, itemW - 4, 18);
                }
                ctx.font = getFont('chip');
                ctx.fillStyle = item.color || colors.brand;
                ctx.fillText(item.text, renderX + 8, y - 1);
              } else if (item.type === 'code') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
                if (ctx.roundRect) {
                  ctx.beginPath();
                  ctx.roundRect(renderX, y - 14, itemW - 4, 18, 4);
                  ctx.fill();
                } else {
                  ctx.fillRect(renderX, y - 14, itemW - 4, 18);
                }
                ctx.font = getFont('code');
                ctx.fillStyle = colors.text;
                ctx.fillText(item.text, renderX + 5, y - 1);
              } else {
                ctx.font = getFont('text');
                ctx.fillStyle = colors.text;
                ctx.fillText(item.text || '', renderX, y);
              }

              renderX += itemW;
              itemIdx = (itemIdx + 1) % rawItems.length;
            }

            x += currentSpan + 8;
          }
        }
      }

      window.addEventListener('resize', resize);
      resize();
    });
  }

  document.addEventListener('DOMContentLoaded', initRichNotes);
})();
