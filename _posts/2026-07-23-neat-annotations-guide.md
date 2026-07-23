---
layout: post
title: "Interactive Hand-Drawn Annotations with neat-annotations"
date: 2026-07-23 10:00:00 +0800
categories: design guide update
comments: true
---

This blog is now powered by **[neat-annotations](https://github.com/syabro/neat-annotations)** — a zero-JS CSS library for hand-drawn arrows, handwritten labels, and inline highlights.

Here is a quick guide on how to annotate text in your Markdown posts using simple HTML markup!

## Directional Arrows

You can point handwritten arrows from 8 different directions:

- **North (`ann-n`)**: <span class="ann ann-n ann-amber" data-note="Points up">Target Text</span> (label sits below)
- **South (`ann-s`)**: <span class="ann ann-s ann-blue" data-note="Points down">Target Text</span> (label sits above)
- **East (`ann-e`)**: <span class="ann ann-e ann-green" data-note="Points right">Target Text</span>
- **West (`ann-w`)**: <span class="ann ann-w ann-purple" data-note="Points left">Target Text</span>
- **North-West (`ann-nw`)**: <span class="ann ann-nw ann-red" data-note="Top-left corner">Target Text</span>

## Color Palette

`neat-annotations` comes with 6 built-in color styles:

1. **Amber**: <span class="ann ann-amber ann-n" data-note="Amber note">Highlight text</span>
2. **Blue**: <span class="ann ann-blue ann-s" data-note="Blue note">Highlight text</span>
3. **Green**: <span class="ann ann-green ann-n" data-note="Green note">Highlight text</span>
4. **Red**: <span class="ann ann-red ann-s" data-note="Red note">Highlight text</span>
5. **Purple**: <span class="ann ann-purple ann-n" data-note="Purple note">Highlight text</span>
6. **Rainbow**: <span class="ann ann-rainbow ann-s" data-note="Animated hues!">Highlight text</span>

## Highlight Only (No Label)

Omit `data-note` and direction classes to create a simple handwritten marker highlight:

You can mark <span class="ann ann-amber">important words</span> or <span class="ann ann-green">key metrics</span> seamlessly inline without arrows or notes.

## Markdown Example

```html
<!-- Example annotation in markdown -->
The system updates <span class="ann ann-n ann-amber" data-note="zero downtime">in real time</span>.
```

Try using annotations in your next technical post to highlight key parameters, architecture points, or code snippets!
