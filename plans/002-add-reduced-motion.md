# 002 — Add prefers-reduced-motion media query

- **Status**: TODO
- **Commit**: 5fb9b9a
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (css/screen.css)

## Problem

The site lacks handling for users who have enabled "Reduced Motion" at the OS level. Currently, animations like the card hover (`transform: translateY(-2px)`) and the footnote popover entrance (`transform: translateY(-6px)`) still trigger spatial movement, which can cause discomfort for these users.

## Target

Introduce a `@media (prefers-reduced-motion: reduce)` block at the bottom of the CSS file. This block should disable `transform` animations (setting them to `none` or `transform: translateY(0) !important`) but keep `opacity` and color-based transitions for necessary feedback.

```css
/* css/screen.css — target additions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .post-card:hover,
  .project-card:hover,
  .brand-logo:hover,
  .brand-logo:hover .brand-icon {
    transform: none !important;
  }
  
  .footnote-popover {
    animation-name: fadeIn !important;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Repo conventions to follow

Append media queries at the end of `css/screen.css` to override base styles.

## Steps

1. Add the `@media (prefers-reduced-motion: reduce)` block to the end of `css/screen.css`, stripping out transforms on cards and logos, and replacing the `fadeInDown` keyframes for the footnote popover with a pure fade.

## Boundaries

- Do NOT remove transitions entirely for reduced motion; `opacity` and color changes must still occur (even if instantaneous).
- Do NOT alter default animations for users without the reduced motion preference.

## Verification

- **Mechanical**: Verify the `@media (prefers-reduced-motion: reduce)` block is present and contains rules overriding `transform`.
- **Feel check**: In Chrome DevTools (Rendering tab), enable "Emulate CSS media feature prefers-reduced-motion: reduce". Hover over `.post-card` and `.project-card`—ensure the cards no longer move up, but the border color and shadow still change. Trigger a footnote popover and ensure it fades in without moving down.
- **Done when**: All spatial movement is suppressed when reduced motion is preferred, while color/opacity feedback remains.