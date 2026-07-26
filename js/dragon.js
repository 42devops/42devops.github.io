/*****************************************************************************/
/* Dragon Pointer Engine                                                     */
/* Adapted from https://github.com/dengshu2/illustrated-manuscript          */
/*****************************************************************************/

(function() {
  const DRAGON_SEGMENT_COUNT = 20;
  const DRAGON_SEGMENT_SPACING = 28;
  const DRAGON_SPRITE_SCALE = 0.20;
  const WING_SEGMENT_INDEX = 5;
  const DRAGON_SEGMENT_WIDTHS = [221, 130, 203, 223, 285, 299, 281, 224, 192, 174, 191, 156, 155, 122, 126, 125, 107, 101, 101, 81];
  const FIRE_COLORS = ['#C4402A', '#E08A30', '#F0C030'];
  const FIRE_STEP_INTERVAL = 80;

  let headCanvas, tongueCanvas, wingFrontCanvas, wingBackCanvas;
  let headDim, tongueDim, wingFrontDim, wingBackDim;
  let bodyCanvases = [];
  let bodyDims = [];
  let loaded = false;

  function hash(seed) {
    let t = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return t - Math.floor(t);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function scaleSprite(img, scale) {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { canvas, w, h };
  }

  async function loadDragonSprites() {
    if (loaded) return;
    try {
      const images = await Promise.all([
        loadImage('/images/dragon-sprites/head.png'),
        loadImage('/images/dragon-sprites/tongue.png'),
        loadImage('/images/dragon-sprites/wing-front.png'),
        loadImage('/images/dragon-sprites/wing-back.png'),
        ...Array.from({ length: 19 }, (_, i) => loadImage(`/images/dragon-sprites/body-${i + 1}.png`))
      ]);

      const s = DRAGON_SPRITE_SCALE;
      let r;
      r = scaleSprite(images[0], s); headCanvas = r.canvas; headDim = { w: r.w, h: r.h };
      r = scaleSprite(images[1], s); tongueCanvas = r.canvas; tongueDim = { w: r.w, h: r.h };
      r = scaleSprite(images[2], s); wingFrontCanvas = r.canvas; wingFrontDim = { w: r.w, h: r.h };
      r = scaleSprite(images[3], s); wingBackCanvas = r.canvas; wingBackDim = { w: r.w, h: r.h };

      bodyCanvases = [];
      bodyDims = [];
      for (let i = 4; i < images.length; i++) {
        r = scaleSprite(images[i], s);
        bodyCanvases.push(r.canvas);
        bodyDims.push({ w: r.w, h: r.h });
      }
      loaded = true;
    } catch (e) {
      console.warn("Failed to load dragon sprites:", e);
    }
  }

  function getSegmentWidth(index) {
    return index < DRAGON_SEGMENT_WIDTHS.length
      ? DRAGON_SEGMENT_WIDTHS[index] * DRAGON_SPRITE_SCALE
      : 10;
  }

  function createDragon(startX, startY, scale = 1) {
    const segments = [];
    for (let i = 0; i < DRAGON_SEGMENT_COUNT; i++) {
      segments.push({
        x: startX,
        y: startY + i * DRAGON_SEGMENT_SPACING * scale,
        angle: -Math.PI / 2,
        width: getSegmentWidth(i) * scale
      });
    }
    return {
      segments,
      jitterSeed: Math.random() * 1000,
      lastStepTime: 0,
      stepInterval: 40,
      fire: [],
      fireLastStep: 0,
      scale
    };
  }

  function getRestPose(startX, startY, scale) {
    const poses = [];
    const spacing = DRAGON_SEGMENT_SPACING * scale;
    poses.push({ x: startX, y: startY - 2, angle: 0 });
    for (let i = 1; i < DRAGON_SEGMENT_COUNT; i++) {
      const angle = -(i / (DRAGON_SEGMENT_COUNT - 1) * (Math.PI / 2) * 1.4);
      const prev = poses[i - 1];
      poses.push({
        x: prev.x - Math.cos(angle) * spacing,
        y: prev.y - Math.sin(angle) * spacing,
        angle
      });
    }
    return poses;
  }

  function updateDragon(dragon, time, mouseX, mouseY, idle = false, restX = 0, restY = 0) {
    if (time - dragon.lastStepTime < dragon.stepInterval) return false;
    dragon.lastStepTime = time;
    dragon.jitterSeed = Math.random() * 1000;

    if (idle) {
      const rest = getRestPose(restX, restY, dragon.scale);
      const lerp = 0.12;
      for (let i = 0; i < dragon.segments.length; i++) {
        const seg = dragon.segments[i];
        const target = rest[i];
        seg.x += (target.x - seg.x) * lerp;
        seg.y += (target.y - seg.y) * lerp;
        let angleDiff = target.angle - seg.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        seg.angle += angleDiff * lerp;
      }
      return true;
    }

    const head = dragon.segments[0];
    const dx = mouseX - head.x;
    const dy = mouseY - head.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      const speed = Math.min(dist, Math.max(10, dist * 0.25));
      head.x += (dx / dist) * speed;
      head.y += (dy / dist) * speed;
      head.angle = Math.atan2(dy, dx);
    }

    const maxBend = 0.25;
    for (let i = 1; i < dragon.segments.length; i++) {
      const prev = dragon.segments[i - 1];
      const seg = dragon.segments[i];
      let angle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
      let diff = angle - prev.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > maxBend) angle = prev.angle + maxBend;
      else if (diff < -maxBend) angle = prev.angle - maxBend;
      seg.angle = angle;
      const spacing = DRAGON_SEGMENT_SPACING * dragon.scale;
      seg.x = prev.x - Math.cos(seg.angle) * spacing;
      seg.y = prev.y - Math.sin(seg.angle) * spacing;
    }
    return true;
  }

  function spawnFire(dragon) {
    const head = dragon.segments[0];
    const scale = dragon.scale;
    const mouthOffset = (headDim ? headDim.w * 0.55 : 30) * scale;
    const fx = head.x + Math.cos(head.angle) * mouthOffset;
    const fy = head.y + Math.sin(head.angle) * mouthOffset;
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.25;
      const speed = (25 + Math.random() * 15) * scale;
      const angle = head.angle + spread;
      dragon.fire.push({
        x: fx + (Math.random() - 0.5) * 4,
        y: fy + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (8 + Math.random() * 12) * scale,
        life: 1,
        maxLife: 12 + Math.floor(Math.random() * 6),
        frame: 0,
        color: Math.floor(Math.random() * 3)
      });
    }
  }

  function updateFire(dragon, time) {
    if (time - dragon.fireLastStep < FIRE_STEP_INTERVAL) return;
    dragon.fireLastStep = time;
    for (let i = dragon.fire.length - 1; i >= 0; i--) {
      const p = dragon.fire[i];
      p.frame++;
      p.life = 1 - p.frame / p.maxLife;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      const gravity = Math.max(0, (p.frame - 4) / p.maxLife);
      p.vy -= gravity * 1.5;
      if (p.life < 0.25) p.size *= 0.75;
      else if (p.frame < 3) p.size *= 1.15;
      if (p.life <= 0 || p.size < 1.5) dragon.fire.splice(i, 1);
    }
  }

  function drawDragon(ctx, dragon) {
    if (!loaded) return;
    const segs = dragon.segments;
    const seed = dragon.jitterSeed;
    const time = performance.now() / 1000;
    const scale = dragon.scale;

    // Wing back
    if (wingBackCanvas) {
      const seg = segs[WING_SEGMENT_INDEX];
      const jx = (hash(seed + WING_SEGMENT_INDEX * 37) - 0.5) * 1.5;
      const jy = (hash(seed + WING_SEGMENT_INDEX * 37 + 100) - 0.5) * 1.5;
      const jr = (hash(seed + WING_SEGMENT_INDEX * 37 + 200) - 0.5) * 0.04;
      const wingFlap = Math.sin(time * 3) * 0.4;
      ctx.save();
      ctx.translate(seg.x + jx, seg.y + jy);
      ctx.rotate(seg.angle + jr + wingFlap);
      ctx.scale(scale, scale);
      const { w, h } = wingBackDim;
      ctx.drawImage(wingBackCanvas, -w, -h, w, h);
      ctx.restore();
    }

    // Body segments back to front
    for (let i = segs.length - 1; i >= 0; i--) {
      const seg = segs[i];
      const jx = (hash(seed + i * 37) - 0.5) * 1.5;
      const jy = (hash(seed + i * 37 + 100) - 0.5) * 1.5;
      const jr = (hash(seed + i * 37 + 200) - 0.5) * 0.04;

      ctx.save();
      ctx.translate(seg.x + jx, seg.y + jy);
      ctx.rotate(seg.angle + jr);
      ctx.scale(scale, scale);

      if (i === 0) {
        if (tongueCanvas) {
          const { w, h } = tongueDim;
          ctx.drawImage(tongueCanvas, headDim.w * 0.3, -h / 2, w, h);
        }
        if (headCanvas) {
          const { w, h } = headDim;
          ctx.drawImage(headCanvas, -w * 0.45, -h / 2, w, h);
        }
      } else {
        const bodyIdx = i - 1;
        const bodyCanvas = bodyCanvases[bodyIdx];
        const dim = bodyDims[bodyIdx];
        if (bodyCanvas && dim) {
          const { w, h } = dim;
          ctx.drawImage(bodyCanvas, -w / 2, -h / 2, w, h);
        }
        if (i === WING_SEGMENT_INDEX && wingFrontCanvas) {
          const wingFlap = Math.sin(time * 3 + 0.5) * 0.4;
          ctx.save();
          const { w, h } = wingFrontDim;
          ctx.rotate(-wingFlap);
          ctx.drawImage(wingFrontCanvas, -w, -h, w, h);
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  function jitterLine(ctx, x1, y1, x2, y2, seed, jitter) {
    for (let s = 1; s <= 4; s++) {
      const t = s / 4;
      const jx = (hash(seed + s * 13) - 0.5) * jitter;
      const jy = (hash(seed + s * 29) - 0.5) * jitter;
      ctx.lineTo(x1 + (x2 - x1) * t + jx, y1 + (y2 - y1) * t + jy);
    }
  }

  function drawFire(ctx, dragon) {
    for (const p of dragon.fire) {
      const angle = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      const decay = 1 - p.life;
      ctx.fillStyle = FIRE_COLORS[decay < 0.33 ? 0 : decay < 0.66 ? 1 : 2];
      const r = p.size / 2;
      const seedBase = p.color * 31 + p.frame * 0.3;
      const jitterFn = (n) => (hash(seedBase + n * 17) - 0.5) * r * 0.4;
      const jitter = r * 0.35;
      const corners = [
        [r * 1.2 + jitterFn(0), jitterFn(1)],
        [jitterFn(2), -r * 0.7 + jitterFn(3)],
        [-r + jitterFn(4), jitterFn(5)],
        [jitterFn(6), r * 0.7 + jitterFn(7)]
      ];
      ctx.beginPath();
      ctx.moveTo(corners[0][0], corners[0][1]);
      for (let j = 0; j < 4; j++) {
        const next = corners[(j + 1) % 4];
        jitterLine(ctx, corners[j][0], corners[j][1], next[0], next[1], seedBase + j * 100, jitter);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  window.DragonEngine = {
    loadDragonSprites,
    createDragon,
    updateDragon,
    spawnFire,
    updateFire,
    drawDragon,
    drawFire,
    isLoaded: () => loaded
  };
})();
