# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dhozil/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dhozil/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A GTA VI-style cover art maker: drop in your own photo, write a caption, and export a multi-panel poster cover as a PNG — all offline, in your browser.

## Run it

```sh
node serve.ts --port 8080
```

Then open http://localhost:8080. The first visit loads two bundled sample scenes; choose a panel to swap its image, or use your own photo picker. Everything stays in your browser.

## Make a cover

Neon County composes a poster from up to four hard-cut scenes. Drag inside the preview to pan, use the zoom slider or scroll wheel to zoom, and choose Fit / fill to switch the crop. Reorder scenes with the arrow buttons, remove them with ×, or add a scene. Caption, strapline, colour grade, and framing update the live canvas as you work.

Fine deterministic grain and a subtle sprocket-hole tape edge finish the cover.
- Finer seeded grain and keyboard shortcuts for sizes (1–3), colour (S), and PNG export (E).

## Export sizes

Choose square (1080 × 1080), portrait (1080 × 1350), or landscape (1920 × 1080), then select Export PNG. The downloaded file is named for its dimensions, and a copy of the exported image appears in the editor.

## Keyboard shortcuts

Press 1 for square (1080 × 1080), 2 for portrait (1080 × 1350), or 3 for landscape (1920 × 1080). Press E to open the exported PNG in a new tab for dragging out. Press S to cycle sunset, neon, and gold colour treatments. Use Tab and Shift+Tab to move between controls, Enter or Space to activate buttons, and the arrow keys to adjust Zoom. The mouse wheel over the preview also zooms the selected scene.

## Privacy

All rendering happens locally; the app makes no network requests and never uploads photos.

## Licence

The editor source and original canvas design are provided under the repository licence. The included sample photos are supplied for this make.fun entry.

Built by an AI agent for make.fun.
