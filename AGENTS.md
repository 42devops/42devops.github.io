# Repository Guidelines

## Project Overview

42devops.github.io is a Jekyll static blog hosted on GitHub Pages with a custom domain (`42devops.com`). The site utilizes the Kami theme with custom extensions, featuring hand-drawn inline annotations powered by `neat-annotations`, interactive HTML5 canvas components (Pretext note layout engine and a dragon kinematic cursor), and dynamic dark/light theme switching.

## Architecture & Data Flow

- Jekyll 3.9.0 handles static generation, driven by GitHub Pages defaults without a custom `_config.yml`.
- Front matter in Markdown posts located in `_posts/` is processed and rendered into Liquid layout templates (`_layouts/default.html` and `_layouts/post.html`).
- Client-side interactivity includes theme persistence stored in `localStorage`, a dynamic table of contents generator built with `IntersectionObserver`, KaTeX math typesetting, Utterances comment integration, code block copy buttons, and HTML5 Canvas engines (`js/hero-pretext.js`, `js/rich-note.js`, and `js/dragon.js`).
- Local Ruby 3 compatibility is provided by `_plugins/ruby3_compat.rb`, which monkey-patches Liquid to handle object taint APIs removed in Ruby 3.

## Key Directories

- `_posts/`: Blog posts written in Markdown (`YYYY-MM-DD-slug.md` or `.markdown`).
- `_layouts/`: Liquid layout templates (`default.html`, `post.html`).
- `_plugins/`: Local Jekyll build compatibility helpers (`ruby3_compat.rb`).
- `css/`: Theme stylesheets (`screen.css`, `syntax.css`, `neat-annotations.css`).
 - `js/`: Interactive scripts (`hero-pretext.js`, `rich-note.js`, `dragon.js`).
- `images/`: Post diagrams and sprite assets (`dragon-sprites/`, `posts/`).
- `random/`: Experimental web and canvas code snippets.

## Development Commands

- Install dependencies:
  ```bash
  bundle install
  ```
- Start local development server:
  ```bash
  RUBYOPT="-r./_plugins/ruby3_compat.rb" bundle exec jekyll serve
  ```
- Build static site locally:
  ```bash
  RUBYOPT="-r./_plugins/ruby3_compat.rb" bundle exec jekyll build
  ```

## Code Conventions & Common Patterns

### Post Front Matter

```yaml
---
layout: post
title: "Post Title"
date: 2026-07-26 12:00:00 +0800
categories: devops jekyll
comments: true
---
```

### Inline Hand-Drawn Annotations (`neat-annotations`)

Inline annotations use HTML elements with specific class names:

- Direction classes: `ann-n`, `ann-s`, `ann-e`, `ann-w`, `ann-ne`, `ann-nw`, `ann-se`, `ann-sw`.
- Color classes: `ann-amber`, `ann-blue`, `ann-green`, `ann-red`, `ann-purple`, `ann-rainbow`.
- Label note syntax: `<span class="ann ann-n ann-amber" data-note="Note text">Target text</span>`
- Highlight syntax: `<span class="ann ann-amber">Highlighted text</span>`

### Pretext Rich Canvas Notes

Canvas notes use container elements with structured JSON attributes:

```html
<div class="pretext-rich-note" data-items='[...]'></div>
```

### Math, Code, & Footnotes

- Math formatting uses `$ inline $` for inline math and `$$ block $$` for block math, rendered client-side via KaTeX.
- Code blocks use fenced Markdown with syntax highlighting configured via Rouge and One Dark theme.
- Footnotes use standard Markdown syntax (`[^1]`), rendered with dynamic popover previews.

### Formatting & Typography

- Do not use headings smaller than H2 (`##` and `###` only).
- Do not use em dashes; use commas, colons, or separate sentences instead.
- Do not use bold text for emphasis.

## Important Files

- `AGENTS.md`: Canonical repository guidelines (this document).
- `Gemfile` & `Gemfile.lock`: Dependency definitions (`github-pages` v207, `jekyll` v3.9.0).
- `CNAME`: Custom domain configuration (`42devops.com`).
- `_plugins/ruby3_compat.rb`: Liquid compatibility patch for Ruby 3 environments.
- `_layouts/default.html` & `_layouts/post.html`: Core layouts and client script injection points.
- `css/screen.css`: Core theme stylesheet and CSS variables.
- `css/neat-annotations.css`: Hand-drawn annotation styles and keyframe definitions.

## Runtime/Tooling Preferences

- Ruby 3.x with Bundler.
- Requires `-r./_plugins/ruby3_compat.rb` set in `RUBYOPT` for local Jekyll execution to support Ruby 3+.
- Relies on default GitHub Pages configuration without a `_config.yml` file.

## Testing & QA

- Perform visual and build verification locally using `RUBYOPT="-r./_plugins/ruby3_compat.rb" bundle exec jekyll build` or `serve`.
- Verify front matter parsing, table of contents generation, KaTeX rendering, theme toggle behavior, and annotation rendering.
