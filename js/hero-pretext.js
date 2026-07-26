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
    "42", "·", "Don't Panic", "·", "一切有为法 如梦幻泡影", "·", "Keep Walking", "·",
    "如露亦如电 应作如是观", "·", "Mostly Harmless", "·", "应无所住 而生其心", "·",
    "So Long", "·", "知我说法 如筏喻者 法尚应舍 何况非法", "·", "Thanks for All the Fish", "·",
    "凡所有相 皆是虚妄", "·", "42DevOps", "·", "若见诸相非相 则见如来", "·",
    "Infrastructure", "·", "Engineering", "·", "Life, the Universe, and Everything", "·"
  ];

  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let wordWidths = [];

  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  let dragon = null;

  function getFont() {
    return `500 13px 'Charter', 'Source Serif 4', 'Noto Serif SC', Georgia, serif`;
  }

  function measureWords() {
    ctx.font = getFont();
    wordWidths = phraseStream.map(w => ctx.measureText(w + " ").width);
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

  function draw(timestamp) {
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

    // Build list of obstacle circles from dragon segments
    const obstacles = [];
    if (dragon && dragon.segments) {
      // Head obstacle
      const head = dragon.segments[0];
      obstacles.push({ x: head.x, y: head.y, r: 48 });

      // Body segment obstacles (every 3rd segment)
      for (let i = 2; i < dragon.segments.length; i += 3) {
        const seg = dragon.segments[i];
        obstacles.push({ x: seg.x, y: seg.y, r: Math.max(16, seg.width * 0.6) });
      }
    }

    for (let y = 18; y < height; y += lineHeight) {
      let x = 12;

      while (x < width - 12) {
        let availableSpan = width - 12 - x;

        // Subtract dragon segment obstacles intersecting line at y
        for (let obs of obstacles) {
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
          x += 16;
          continue;
        }

        let renderX = x;
        for (let i = 0; i < count; i++) {
          ctx.fillText(phraseStream[wordIdx], renderX, y);
          renderX += wordWidths[wordIdx];
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

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
