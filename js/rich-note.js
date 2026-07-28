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
        console.error('Invalid data-items JSON in .pretext-rich-note', e);
        return;
      }

      if (!rawItems.length) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'pretext-rich-note-canvas';
      canvas.style.cssText = 'width: 100%; display: block;';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let dpr = window.devicePixelRatio || 1;
      let width = 0;
      let itemWidths = [];

      function getFont(type = 'text') {
        if (type === 'title') {
          return `700 16px 'Plus Jakarta Sans', 'Inter', sans-serif`;
        }
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
        if (item.type === 'title') {
          ctx.font = getFont('title');
          return ctx.measureText(item.text).width + 10;
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

      function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
          text: style.getPropertyValue('--text-main').trim() || '#141413',
          brand: style.getPropertyValue('--brand-primary').trim() || '#1B365D',
          subtle: style.getPropertyValue('--border-color').trim() || '#e8e6dc'
        };
      }

      function layoutAndRender() {
        const rect = container.getBoundingClientRect();
        width = rect.width || 600;
        dpr = window.devicePixelRatio || 1;

        measureItems();
        const colors = getThemeColors();

        const paddingX = 16;
        const paddingY = 20;
        const lineHeight = 28;
        const availableWidth = Math.max(200, width - paddingX * 2);

        let currentX = paddingX;
        let currentY = paddingY + 6;
        let itemIdx = 0;

        const renderOps = [];

        while (itemIdx < rawItems.length) {
          const item = rawItems[itemIdx];
          const itemW = itemWidths[itemIdx];
          const isTitle = (typeof item === 'object' && item.type === 'title');

          // If title, force new line if not at line start
          if (isTitle && currentX > paddingX) {
            currentX = paddingX;
            currentY += lineHeight + 4;
          }

          // If item overflows current line, wrap to next line
          if (currentX + itemW > paddingX + availableWidth && currentX > paddingX) {
            currentX = paddingX;
            currentY += lineHeight;
          }

          renderOps.push({
            item,
            width: itemW,
            x: currentX,
            y: currentY
          });

          currentX += itemW + 6;

          // If title, force line break after title
          if (isTitle) {
            currentX = paddingX;
            currentY += lineHeight + 4;
          }

          itemIdx++;
        }

        const calculatedHeight = Math.max(90, currentY + paddingY);

        canvas.width = width * dpr;
        canvas.height = calculatedHeight * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = calculatedHeight + 'px';
        container.style.height = calculatedHeight + 'px';

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, calculatedHeight);

        renderOps.forEach(op => {
          const { item, width: itemW, x, y } = op;

          if (typeof item === 'string') {
            ctx.font = getFont('text');
            ctx.fillStyle = colors.text;
            ctx.fillText(item, x, y);
          } else if (item.type === 'title') {
            ctx.font = getFont('title');
            ctx.fillStyle = colors.brand;
            ctx.fillText(item.text, x, y);
          } else if (item.type === 'chip') {
            ctx.fillStyle = item.bg || 'rgba(27, 54, 93, 0.12)';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(x, y - 14, itemW - 4, 18, 9);
              ctx.fill();
            } else {
              ctx.fillRect(x, y - 14, itemW - 4, 18);
            }
            ctx.font = getFont('chip');
            ctx.fillStyle = item.color || colors.brand;
            ctx.fillText(item.text, x + 8, y - 1);
          } else if (item.type === 'code') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(x, y - 14, itemW - 4, 18, 4);
              ctx.fill();
            } else {
              ctx.fillRect(x, y - 14, itemW - 4, 18);
            }
            ctx.font = getFont('code');
            ctx.fillStyle = colors.text;
            ctx.fillText(item.text, x + 5, y - 1);
          } else {
            ctx.font = getFont('text');
            ctx.fillStyle = colors.text;
            ctx.fillText(item.text || '', x, y);
          }
        });
      }

      let resizeTimeout = null;
      function handleResize() {
        if (resizeTimeout) {
          cancelAnimationFrame(resizeTimeout);
        }
        resizeTimeout = requestAnimationFrame(layoutAndRender);
      }

      window.addEventListener('resize', handleResize);
      layoutAndRender();
    });
  }

  document.addEventListener('DOMContentLoaded', initRichNotes);
})();
