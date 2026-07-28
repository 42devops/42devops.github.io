# 005 — Apply Kami Typography and Shadow Rules

- **Status**: TODO
- **Severity**: MEDIUM
- **Category**: Cohesion & Design System
- **Estimated scope**: 1 file (css/screen.css)

## Problem
The site's current styles are very close to the Kami design system but diverge on several strict rules:
1. Chinese body text uses Serif, but Kami dictates: "中文标题用 serif、正文用 sans".
2. Line height is 1.65, whereas Kami dictates `1.55` for reading body text.
3. Shadows use hard drop shadows instead of whisper/ring shadows.
4. Dark mode tags use `rgba`, which WeasyPrint renders incorrectly as double overlapping rectangles.
5. Blockquotes use 3px border and muted color, whereas Kami dictates "左 2pt 品牌实线 + olive 色" (2px brand solid line + olive).
6. Inline code uses borders, whereas Kami dictates "ivory 底 + 4pt 圆角 + 无边框".

## Target
Align `css/screen.css` exactly with Kami v1.11.0 specifications.

## Steps
1. Add `--text-olive: #504e49;` to `:root` and `--text-olive: #a19f96;` to `[data-theme="dark"]`.
2. Update dark mode `--brand-light` to `#2e3740` and `--tag-bg` to `#2c343b` (solid hex instead of rgba).
3. Update shadows in `:root` to use whisper shadow values:
   `--shadow-sm: 0 4px 12px rgba(20, 20, 19, 0.03);`
   `--shadow-md: 0 4px 24px rgba(20, 20, 19, 0.05);`
   `--shadow-hover: 0 8px 32px rgba(20, 20, 19, 0.08);`
4. Update dark mode shadows to match whisper proportions.
5. Change `body` and `.post-content` `font-family` to `var(--font-sans)` and `line-height` to `1.55`.
6. Update `.post-content blockquote` to `border-left: 2px solid var(--brand-primary);` and `color: var(--text-olive);`.
7. Update `.post-content :not(pre) > code` to remove `border: 1px solid var(--border-subtle);`.

## Verification
- **Mechanical**: Verify the variables and font-families in `css/screen.css`.
- **Feel check**: Read a blog post to confirm the body text is now Sans-serif, line height is slightly tighter, and shadows are softer (whisper).
