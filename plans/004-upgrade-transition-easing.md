# 004 — Upgrade --transition-fast easing curve

- **Status**: TODO
- **Commit**: 5fb9b9a
- **Severity**: LOW
- **Category**: Cohesion & Easing
- **Estimated scope**: 1 file (css/screen.css)

## Problem

`--transition-fast` uses the default `ease` curve (`0.15s ease`). The default `ease` curve has a slight delay at the beginning (it accelerates slowly), which makes UI hover feedback feel slightly sluggish, even over a short 150ms duration. UI entrances and hover feedback should feel immediate.

```css
/* css/screen.css:39 — current */
--transition-fast: 0.15s ease;
```

## Target

Replace `ease` with a stronger, more decisive `ease-out` curve. According to Emil Kowalski's guidelines, `ease-out` starts fast and feels responsive. We will define an explicit token for it.

```css
/* css/screen.css — target */
:root {
  /* ... */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --transition-fast: 0.15s var(--ease-out);
  /* ... */
}
```

## Repo conventions to follow

- Define the curve as a CSS variable in `:root` alongside other tokens.

## Steps

1. In `css/screen.css`, add `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` inside `:root`.
2. Change `--transition-fast: 0.15s ease;` to `--transition-fast: 0.15s var(--ease-out);`.

## Boundaries

- Do NOT alter `--transition-normal`.
- Do NOT change the 0.15s (150ms) duration.

## Verification

- **Mechanical**: Verify `--ease-out` is defined and used by `--transition-fast`.
- **Feel check**: Hover over buttons and links. The feedback (color change, subtle transforms if present) should feel slightly snappier and more immediate than before.
- **Done when**: `ease` is removed from global transition variables in favor of a strong `ease-out`.