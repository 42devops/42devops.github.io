# 001 — Replace transition: all with explicit hardware-accelerated properties

- **Status**: TODO
- **Commit**: 5fb9b9a
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (css/screen.css), 5 locations

## Problem

Global use of `transition: all` is a major performance anti-pattern. It forces the browser to animate every property that changes, often triggering expensive layout, paint, and composite cycles on the main thread, leading to dropped frames (jank).

```css
/* css/screen.css:216 — current */
.theme-toggle-btn {
  /* ... */
  transition: all var(--transition-fast);
}

/* css/screen.css:327 — current */
.filter-pill {
  /* ... */
  transition: all var(--transition-fast);
}

/* css/screen.css:381 — current */
.post-card {
  /* ... */
  transition: all var(--transition-normal);
}

/* css/screen.css:462 — current */
.project-card {
  /* ... */
  transition: all var(--transition-normal);
}

/* css/screen.css:651 — current */
.copy-btn {
  /* ... */
  transition: all var(--transition-fast);
}
```

## Target

Replace `transition: all` with explicit properties that map to the actual changes occurring on `:hover` or state changes. Hardware-accelerated properties like `transform`, `opacity`, and `color`/`background-color`/`box-shadow`/`border-color` (which don't trigger layout) should be targeted directly.

```css
/* css/screen.css — target (examples) */
.theme-toggle-btn {
  transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.filter-pill {
  transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.post-card, .project-card {
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.copy-btn {
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
```

## Repo conventions to follow

The repo uses CSS variables for transitions (e.g., `var(--transition-fast)`, `var(--transition-normal)`).

- Keep the existing transition variables.
- Separate multiple transition properties with commas.

## Steps

1. In `css/screen.css`, replace `.theme-toggle-btn`'s `transition: all ...` with `transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);`.
2. Replace `.filter-pill`'s `transition: all ...` with `transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast);`.
3. Replace `.post-card`'s `transition: all ...` with `transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);`.
4. Replace `.project-card`'s `transition: all ...` with `transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);`.
5. Replace `.copy-btn`'s `transition: all ...` with `transition: background-color var(--transition-fast), color var(--transition-fast);`.

## Boundaries

- Do NOT touch other `.css` or `.js` files.
- Do NOT change the animation durations or easings defined in `:root`.

## Verification

- **Mechanical**: Run `grep "transition: all" css/screen.css` to ensure no instances remain.
- **Feel check**: Open the site, hover over cards, pills, the theme toggle, and copy buttons. Confirm the visual changes remain smooth and identical, but dev tools show no unnecessary layout/paint operations during the transition (Performance tab).
- **Done when**: All instances of `transition: all` on the identified interactive elements have been replaced with explicit property lists.