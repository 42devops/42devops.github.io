/*****************************************************************************/
/* Pretext Typographic Obstacle Engine for Hero Banner                       */
/* Inspired by Cheng Lou's Pretext (https://chenglou.me/pretext/)            */
/*****************************************************************************/

(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('hero-pretext-canvas');
  const container = document.querySelector('.hero-banner');
  const targetObj = document.querySelector('.hero-annotation-wrapper');
  if (!canvas || !container || !targetObj) return;

  const ctx = canvas.getContext('2d');
  const phraseStream = [
    "42DevOps", "·", "Infrastructure", "Engineering", "·", "Kubernetes", "Clusters", "·",
    "Distributed", "Systems", "·", "High", "Performance", "Algorithms", "·", "Site", "Reliability", "·",
    "Automation", "·", "Cloud", "Native", "·", "Observability", "·", "Linux", "Kernel", "·",
    "System", "Architecture", "·", "SRE", "Notes", "·"
  ];

  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let wordWidths = [];

  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  const orbRadius = 65;

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

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp for mouse motion
    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;

    const targetRect = targetObj.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Bounds for the central compass annotation cluster
    const centerObstacle = {
      x: targetRect.left - containerRect.left + targetRect.width / 2,
      y: targetRect.top - containerRect.top + targetRect.height / 2,
      rx: targetRect.width / 2 + 30,
      ry: targetRect.height / 2 + 20
    };

    const colors = getThemeColors();
    ctx.font = getFont();
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = 0.28;

    const lineHeight = 24;
    let wordIdx = 0;

    for (let y = 22; y < height; y += lineHeight) {
      let x = 12;

      while (x < width - 12) {
        let availableSpan = width - 12 - x;

        // 1. Subtract central compass cluster obstacle
        if (Math.abs(y - centerObstacle.y) < centerObstacle.ry) {
          const obsLeft = centerObstacle.x - centerObstacle.rx;
          const obsRight = centerObstacle.x + centerObstacle.rx;

          if (x < obsRight && x + availableSpan > obsLeft) {
            if (x < obsLeft) {
              availableSpan = obsLeft - x;
            } else {
              x = obsRight;
              availableSpan = width - 12 - x;
            }
          }
        }

        // 2. Subtract mouse orb obstacle
        if (mouse.x > 0 && Math.abs(y - mouse.y) < orbRadius) {
          const dy = Math.abs(y - mouse.y);
          const dx = Math.sqrt(orbRadius * orbRadius - dy * dy);
          const orbLeft = mouse.x - dx;
          const orbRight = mouse.x + dx;

          if (x < orbRight && x + availableSpan > orbLeft) {
            if (x < orbLeft) {
              availableSpan = orbLeft - x;
            } else {
              x = orbRight;
              availableSpan = width - 12 - x;
            }
          }
        }

        let currentSpan = 0;
        let startWordIdx = wordIdx;

        while (wordIdx < phraseStream.length && currentSpan + wordWidths[wordIdx] <= availableSpan) {
          currentSpan += wordWidths[wordIdx];
          wordIdx = (wordIdx + 1) % phraseStream.length;
          if (wordIdx === startWordIdx) break;
        }

        if (currentSpan <= 0) {
          x += 20;
          continue;
        }

        let renderX = x;
        let count = (wordIdx >= startWordIdx) ? (wordIdx - startWordIdx) : (phraseStream.length - startWordIdx + wordIdx);

        for (let i = 0; i < count; i++) {
          const idx = (startWordIdx + i) % phraseStream.length;
          ctx.fillText(phraseStream[idx], renderX, y);
          renderX += wordWidths[idx];
        }

        x += currentSpan + 8;
      }
    }

    // Subtle magnetic aura under cursor
    if (mouse.x > 0) {
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = colors.brand;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, orbRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
