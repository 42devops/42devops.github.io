# AGENTS.md

## What this is

Jekyll blog for [42devops.com](https://42devops.com), hosted on GitHub Pages. Custom domain configured via `CNAME`. Modern, sleek theme design featuring hand-drawn inline annotations powered by `neat-annotations`.

## Structure

- `_posts/` - Markdown posts, filename format: `YYYY-MM-DD-slug.md` (or `.markdown`)
- `_layouts/` - `default.html`, `post.html`
- `_plugins/` - Local Jekyll build compatibility helpers (`ruby3_compat.rb`)
- `css/` - Static assets (`screen.css`, `syntax.css`, `neat-annotations.css`)
- `js/` - Static scripts
- `images/` - Site images
- `random/` - Misc experiments

## Local dev

```bash
bundle install
RUBYOPT="-r./_plugins/ruby3_compat.rb" bundle exec jekyll serve
```

No `_config.yml` present. GitHub Pages uses defaults. Posts use YAML front matter with `layout`, `title`, `date`, `categories`, `comments`.

## Annotations Usage (`neat-annotations`)

In Markdown posts, use inline annotations with direction and color classes:

```html
<span class="ann ann-n ann-amber" data-note="Handwritten label">Target text</span>
```

Directions: `ann-n`, `ann-s`, `ann-e`, `ann-w`, `ann-nw`, `ann-ne`, `ann-se`, `ann-sw`.
Colors: `ann-amber`, `ann-blue`, `ann-green`, `ann-red`, `ann-purple`, `ann-rainbow`.

## Gotchas

- No `_config.yml` means GitHub Pages defaults apply.
- Deploy is automatic via GitHub Pages on push to main/master branch.
