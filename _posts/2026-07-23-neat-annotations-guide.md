---
layout: post
title: "Interactive Hand-Drawn Annotations with neat-annotations"
date: 2026-07-23 10:00:00 +0800
categories: design guide update
comments: true
---

This blog is now powered by **[neat-annotations](https://github.com/syabro/neat-annotations)** — a zero-JS CSS library for hand-drawn arrows, handwritten labels, and inline highlights.

Here is a quick reference guide on how to annotate text in your Markdown articles!

## Inline Highlights (Recommended for body text)

When annotating inline body text, use **highlight-only** markers without floating notes or arrows. They render cleanly without disrupting line height or overlapping adjacent text:

<div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 1.5rem 1.75rem; margin: 1.5rem 0; border: 1px solid var(--border-color);">
  You can mark <span class="ann ann-amber">important words</span>, highlight <span class="ann ann-blue">key metrics</span>, or emphasize <span class="ann ann-green">critical commands</span> seamlessly inside any paragraph.
</div>

## Code & Specification Showcase ("In the Wild")

When you want to point arrows at code tokens, parameters, or specifications, give lines generous line-height (`3.4em`) so hand-drawn labels sit cleanly around the target text:

<div class="ann-showcase-card">
  <div style="color: var(--text-light); font-size: 0.8rem; line-height: 1; margin-bottom: 3.8rem; display: flex; align-items: center; gap: 0.5rem;">
    <span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27c93f;">●</span>
    <span style="margin-left: 0.5rem;">docs/specs/cli.md</span>
  </div>

  <div style="margin-bottom: 2.5rem;">
    - <span class="ann ann-amber ann-s" data-note="open task">[ ]</span>
    <span class="ann ann-blue ann-s" data-note="stable ID">CLI-042</span> Add export command
    <span class="ann ann-green ann-se" data-note="tag">#cli</span>
    <span class="ann ann-red ann-sw" data-note="priority">!high</span>
    <span class="ann ann-purple ann-nw" data-note="custom field">@blocked_by:CLI-041</span>
  </div>

  <div style="margin-top: 2rem;">
    Write task output as <span class="ann ann-n ann-amber" data-note="description">JSON</span> for scripts and agents
  </div>
</div>

## Markdown Markup Syntax

To add annotations to your Markdown posts, simply wrap your target text in a `<span>` tag:

```html
<!-- Highlight only (no arrow) -->
<span class="ann ann-amber">important note</span>

<!-- Arrow pointing South with handwritten label -->
<span class="ann ann-s ann-blue" data-note="stable ID">CLI-042</span>

<!-- Arrow pointing North with handwritten label -->
<span class="ann ann-n ann-amber" data-note="description">JSON</span>
```
