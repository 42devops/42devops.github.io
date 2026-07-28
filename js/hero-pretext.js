/*****************************************************************************/
/* Pretext Typographic Obstacle Engine for Hero Banner                       */
/* Inspired by Cheng Lou's Pretext (https://chenglou.me/pretext/)            */
/* with Dragon Cursor integration from illustrated-manuscript               */
/*****************************************************************************/

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('hero-pretext-canvas');
  const container = document.querySelector('.hero-banner');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  const phraseStream = [
    { type: 'chip', text: '0x42', bg: 'rgba(27, 54, 93, 0.15)', color: '#1B365D' },
    { type: 'text', text: "Hello World" },
    "·",
    { type: 'code', text: '127.0.0.1' },
    "·",
    { type: 'chip', text: 'K8s', bg: 'rgba(50, 108, 229, 0.15)', color: '#2563eb' },
    "·",
    { type: 'chip', text: "Don't Panic", bg: 'rgba(225, 29, 72, 0.15)', color: '#be123c' },
    "·",
    { type: 'chip', text: '一切有为法 如梦幻泡影', bg: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed' },
    "·",
    { type: 'chip', text: 'DevOps', bg: 'rgba(46, 117, 89, 0.15)', color: '#059669' },
    "·",
    "Keep Walking", "·",
    { type: 'chip', text: '如露亦如电 应作如是观', bg: 'rgba(124, 58, 237, 0.15)', color: '#6d28d9' },
    "·",
    { type: 'code', text: 'kubectl apply -f' },
    "·",
    { type: 'chip', text: 'Mostly Harmless', bg: 'rgba(8, 145, 178, 0.15)', color: '#0891b2' },
    "·",
    "应无所住 而生其心", "·", "So Long", "·",
    "知我说法 如筏喻者", "·", "法尚应舍 何况非法", "·",
    { type: 'chip', text: 'Thanks for All the Fish', bg: 'rgba(225, 29, 72, 0.15)', color: '#e11d48' },
    "·",
    { type: 'chip', text: 'v1.30', bg: 'rgba(217, 119, 6, 0.15)', color: '#d97706' },
    "·",
    { type: 'code', text: 'Home Sweet Home' },
    "·",
    "凡所有相 皆是虚妄", "·", "若见诸相非相 则见如来", "·",
    "竹杖芒鞋轻胜马", "·",
    { type: 'chip', text: '一蓑烟雨任平生', bg: 'rgba(217, 119, 6, 0.15)', color: '#b45309' },
    "·",
    "回首向来萧瑟处", "·", "也无风雨也无晴", "·",
    { type: 'chip', text: '行到水穷处', bg: 'rgba(8, 145, 178, 0.15)', color: '#0891b2' },
    "·",
    { type: 'chip', text: '坐看云起时', bg: 'rgba(50, 108, 229, 0.15)', color: '#2563eb' },
    "·",
    "寄蜉蝣于天地", "·", "渺沧海之一粟", "·", "但愿人长久", "·", "千里共婵娟", "·",
    "蓦然回首", "·", "灯火阑珊处", "·",
    { type: 'chip', text: '上善若水', bg: 'rgba(8, 145, 178, 0.15)', color: '#0e7490' },
    "·",
    "水善利万物而不争", "·",
    { type: 'chip', text: '道生一 一生二', bg: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed' },
    "·", "三生万物", "·",
    { type: 'code', text: 'There is no cloud' },
    "·",
    { type: 'code', text: 'Kernel Panic' },
    "·",
    { type: 'chip', text: 'Tears in rain', bg: 'rgba(8, 145, 178, 0.15)', color: '#0891b2' },
    "·",
    "Do not go gentle", "·",
    { type: 'chip', text: 'Stay hungry, stay foolish', bg: 'rgba(217, 119, 6, 0.15)', color: '#d97706' },
    "·",
    { type: 'chip', text: '42DevOps', bg: 'rgba(27, 54, 93, 0.18)', color: '#1B365D' },
    "·",
    { type: 'chip', text: 'Infrastructure', bg: 'rgba(46, 117, 89, 0.15)', color: '#059669' },
    "·",
    { type: 'chip', text: 'Kubernetes', bg: 'rgba(50, 108, 229, 0.15)', color: '#2563eb' },
    "·",
    { type: 'chip', text: 'Life, the Universe, and Everything', bg: 'rgba(225, 29, 72, 0.15)', color: '#be123c' },
    "·"
  ];

  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let wordWidths = [];

  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  let dragon = null;

  function getFont(type = 'text') {
    if (type === 'code') {
      return `12px 'JetBrains Mono', 'Fira Code', Consolas, monospace`;
    }
    if (type === 'chip') {
      return `600 11px 'Plus Jakarta Sans', 'Inter', sans-serif`;
    }
    return `500 13px 'Charter', 'Source Serif 4', 'Noto Serif SC', Georgia, serif`;
  }

  function getItemWidth(item) {
    if (typeof item === 'string') {
      ctx.font = getFont('text');
      return ctx.measureText(item + " ").width;
    }
    if (item.type === 'chip') {
      ctx.font = getFont('chip');
      return ctx.measureText(item.text).width + 18;
    }
    if (item.type === 'code') {
      ctx.font = getFont('code');
      return ctx.measureText(item.text).width + 12;
    }
    ctx.font = getFont('text');
    return ctx.measureText((item.text || '') + " ").width;
  }

  function measureWords() {
    wordWidths = phraseStream.map(getItemWidth);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    measureWords();

    if (!dragon && window.DragonEngine) {
      dragon = window.DragonEngine.createDragon(width / 2, height / 2, 0.20);
    }
  }

  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      text: style.getPropertyValue('--text-light').trim() || '#6b6a64',
      brand: style.getPropertyValue('--brand-primary').trim() || '#1B365D'
    };
  }

  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  container.addEventListener('pointerleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  container.addEventListener('click', () => {
    if (dragon && window.DragonEngine) {
      window.DragonEngine.spawnFire(dragon);
    }
  });

  if (window.DragonEngine) {
    window.DragonEngine.loadDragonSprites();
  }

  let animationFrameId = null;
  let isHeroVisible = true;

  function draw(timestamp) {
    if (!isHeroVisible) {
      animationFrameId = null;
      return;
    }
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp for mouse motion
    mouse.x += (mouse.targetX - mouse.x) * 0.15;
    mouse.y += (mouse.targetY - mouse.y) * 0.15;

    // Update dragon physics
    if (dragon && window.DragonEngine) {
      const isIdle = mouse.x < 0;
      window.DragonEngine.updateDragon(
        dragon,
        timestamp,
        mouse.x < 0 ? width / 2 : mouse.x,
        mouse.y < 0 ? height / 2 : mouse.y,
        isIdle,
        width / 2,
        height / 2
      );
      window.DragonEngine.updateFire(dragon, timestamp);
    }

    const colors = getThemeColors();
    ctx.font = getFont();
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = 0.28;

    const lineHeight = 22;
    let wordIdx = 0;

    // Build list of obstacles (dragon circles + DOM element rectangles)
    const circularObstacles = [];
    if (dragon && dragon.segments) {
      // Head obstacle
      const head = dragon.segments[0];
      circularObstacles.push({ x: head.x, y: head.y, r: 48 });

      // Body segment obstacles (every 3rd segment)
      for (let i = 2; i < dragon.segments.length; i += 3) {
        const seg = dragon.segments[i];
        circularObstacles.push({ x: seg.x, y: seg.y, r: Math.max(16, seg.width * 0.6) });
      }
    }

    // Query DOM obstacles inside container
    const domObstacles = [];
    const containerRect = container.getBoundingClientRect();
    const obstacleElements = container.querySelectorAll('.pretext-obstacle, .hero-title, .hero-subtitle');
    obstacleElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const pad = 12; // padding around UI elements
      const top = rect.top - containerRect.top - pad;
      const bottom = rect.bottom - containerRect.top + pad;
      const left = rect.left - containerRect.left - pad;
      const right = rect.right - containerRect.left + pad;
      if (right > 0 && left < width && bottom > 0 && top < height) {
        domObstacles.push({ left, right, top, bottom });
      }
    });

    for (let y = 18; y < height; y += lineHeight) {
      let x = 12;

      while (x < width - 12) {
        let availableSpan = width - 12 - x;

        // 1. Subtract dragon circular segment obstacles intersecting line at y
        for (let obs of circularObstacles) {
          const dy = Math.abs(y - obs.y);
          if (dy < obs.r) {
            const dx = Math.sqrt(obs.r * obs.r - dy * dy);
            const obsLeft = obs.x - dx;
            const obsRight = obs.x + dx;

            if (x < obsRight && x + availableSpan > obsLeft) {
              if (x < obsLeft) {
                availableSpan = obsLeft - x;
              } else {
                x = obsRight;
                availableSpan = width - 12 - x;
              }
            }
          }
        }

        // 2. Subtract DOM rectangular obstacles intersecting line at y
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
        let checkIdx = wordIdx;

        while (currentSpan + wordWidths[checkIdx] <= availableSpan) {
          currentSpan += wordWidths[checkIdx];
          count++;
          checkIdx = (checkIdx + 1) % phraseStream.length;
          if (count === phraseStream.length) break;
        }

        if (count === 0) {
          // If phrase doesn't fit in gap, try CJK/character sub-chunk fitting for string items
          const item = phraseStream[wordIdx];
          if (typeof item === 'string') {
            let subFit = "";
            let subWidth = 0;
            for (let char of item) {
              const charWidth = ctx.measureText(char).width;
              if (subWidth + charWidth <= availableSpan) {
                subFit += char;
                subWidth += charWidth;
              } else {
                break;
              }
            }

            if (subFit.length > 0 && availableSpan > 20) {
              ctx.font = getFont('text');
              ctx.fillStyle = colors.text;
              ctx.fillText(subFit, x, y);
              x += subWidth + 8;
            } else {
              x += 16;
            }
          } else {
            x += 16;
          }
          continue;
        }

        let renderX = x;
        for (let i = 0; i < count; i++) {
          const item = phraseStream[wordIdx];
          const itemW = wordWidths[wordIdx];

          if (typeof item === 'string') {
            ctx.font = getFont('text');
            ctx.fillStyle = colors.text;
            ctx.fillText(item, renderX, y);
          } else if (item.type === 'chip') {
            // Draw Atomic Chip pill
            ctx.fillStyle = item.bg || 'rgba(27, 54, 93, 0.18)';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(renderX, y - 12, itemW - 4, 16, 8);
              ctx.fill();
            } else {
              ctx.fillRect(renderX, y - 12, itemW - 4, 16);
            }
            // Draw Chip label
            ctx.font = getFont('chip');
            ctx.fillStyle = item.color || colors.brand;
            ctx.fillText(item.text, renderX + 7, y - 1);
          } else if (item.type === 'code') {
            // Draw Code span background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(renderX, y - 12, itemW - 4, 16, 4);
              ctx.fill();
            } else {
              ctx.fillRect(renderX, y - 12, itemW - 4, 16);
            }
            ctx.font = getFont('code');
            ctx.fillStyle = colors.text;
            ctx.fillText(item.text, renderX + 4, y - 1);
          } else {
            ctx.font = getFont('text');
            ctx.fillStyle = colors.text;
            ctx.fillText(item.text || '', renderX, y);
          }

          renderX += itemW;
          wordIdx = (wordIdx + 1) % phraseStream.length;
        }

        x += currentSpan + 8;
      }
    }

    // Render dragon and fire on top of text
    if (dragon && window.DragonEngine && window.DragonEngine.isLoaded()) {
      ctx.globalAlpha = 1.0;
      window.DragonEngine.drawDragon(ctx, dragon);
      window.DragonEngine.drawFire(ctx, dragon);
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  let resizeTimeout = null;
  function handleResize() {
    if (resizeTimeout) {
      cancelAnimationFrame(resizeTimeout);
    }
    resizeTimeout = requestAnimationFrame(() => {
      resize();
      if (isHeroVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(draw);
      }
    });
  }

  window.addEventListener('resize', handleResize);
  resize();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible) {
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(draw);
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  } else {
    animationFrameId = requestAnimationFrame(draw);
  }
})();
