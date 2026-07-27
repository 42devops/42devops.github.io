# 003 — Animate category filter transitions

- **Status**: TODO
- **Commit**: 5fb9b9a
- **Severity**: LOW
- **Category**: Missed Opportunity
- **Estimated scope**: 1 file (js/main.js) + 1 file (css/screen.css)

## Problem

When filtering blog posts by category, the transition is instantaneous (`display: block` / `display: none`). This abrupt change (teleporting) is jarring and provides no visual continuity.

```javascript
/* js/main.js:84-88 — current */
if (filter === 'all' || categories.includes(filter)) {
  card.style.display = 'block';
} else {
  card.style.display = 'none';
}
```

## Target

Implement a smooth transition for filtering. Because we cannot animate `display` directly, we should apply a CSS class (e.g., `.hidden-card`) that animates `opacity` and `transform` to hide elements smoothly, waiting for the transition to finish before setting `display: none`. Using `opacity: 0` and `transform: scale(0.97)` is a subtle, grounded way to hide items.

```css
/* css/screen.css — target additions */
.post-card {
  /* Existing styles */
  opacity: 1;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal), opacity var(--transition-fast);
}

.post-card.hidden-card {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
}
```

```javascript
/* js/main.js — target logic */
if (filter === 'all' || categories.includes(filter)) {
  card.style.display = 'block';
  // Force reflow
  void card.offsetWidth;
  card.classList.remove('hidden-card');
} else {
  card.classList.add('hidden-card');
  setTimeout(() => {
    if (card.classList.contains('hidden-card')) {
      card.style.display = 'none';
    }
  }, 150); // Matches --transition-fast (150ms)
}
```

## Repo conventions to follow

- JS logic lives in `js/main.js` inside event listeners.
- Transition timing should align with the CSS variables (150ms).

## Steps

1. In `css/screen.css`, add the `.hidden-card` class with `opacity: 0; transform: scale(0.97); pointer-events: none;`. Add `opacity var(--transition-fast)` to the `.post-card` transition list (combining this with Plan 001).
2. In `js/main.js`, update the filter logic loop to use `.classList.add('hidden-card')` and `.classList.remove('hidden-card')` combined with `setTimeout` for the `display: none` toggle, and a forced reflow for `display: block`.

## Boundaries

- Do NOT attempt to animate layout metrics (width/height/margin) for grid reflow, just animate the cards themselves fading in/out.

## Verification

- **Mechanical**: Ensure `.hidden-card` exists in CSS and is toggled in JS.
- **Feel check**: Click category pills. Cards that don't match should subtly shrink and fade out over ~150ms before disappearing, rather than instantly vanishing. Matching cards should reappear and fade in.
- **Done when**: Filtering posts provides smooth visual feedback instead of an instantaneous cut.