// Deterministic fixed-coordinate grain; strengths scale the original finish.
export function drawVignette(context, width, height, strength) {
  context.save();
  context.globalAlpha = Math.max(0, strength);
  const vignette = context.createRadialGradient(
    width / 2, height * 0.46, width * 0.22, width / 2, height * 0.46, width * 0.78,
  );
  vignette.addColorStop(0.55, '#090a1900');
  vignette.addColorStop(1, '#080917bb');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  context.restore();
}

let grainTile;

// The tile is seeded so every render is identical.
export function drawGrain(context, width, height, strength) {
  context.save();
  context.globalAlpha = 0.09 * Math.max(0, strength);
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = grainTile.height = 96;
    const tile = grainTile.getContext('2d');
    const pixels = tile.createImageData(96, 96);
    let seed = 1977;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = Math.max(0, Math.min(255, ((seed >>> 24) - 128) * 1.25 + 128));
      pixels.data.set([value, value, value, 80], i);
    }
    tile.putImageData(pixels, 0, 0);
  }
  context.fillStyle = context.createPattern(grainTile, 'repeat');
  context.fillRect(0, 0, width, height);
  context.restore();
}

export function drawScanlines(ctx, w, h, strength, colour) {
  ctx.save();
  ctx.globalAlpha = 0.08 * Math.max(0, strength);
  ctx.fillStyle = colour;
  for (let y = 0; y < h; y += 7) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}

export function drawLightLeak(ctx, w, h, strength, colour) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, strength);
  const glow = ctx.createRadialGradient(0, h * .3, 0, 0, h * .3, w * .7);
  glow.addColorStop(0, colour);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function drawLetterbox(ctx, w, h, heightRatio) {
  ctx.save();
  const band = Math.round(h * Math.max(0, Math.min(0.5, heightRatio)));
  ctx.fillStyle = '#080917';
  ctx.fillRect(0, 0, w, band);
  ctx.fillRect(0, h - band, w, band);
  ctx.restore();
}

export function drawTapeEdge(ctx, w, h, height) {
  ctx.save();
  ctx.fillStyle = '#08091788';
  ctx.fillRect(0, 0, height, h);
  ctx.fillRect(w - height, 0, height, h);
  ctx.fillStyle = '#ffe7c566';
  for (let y = height; y < h - height; y += height * 1.8) {
    ctx.fillRect(height * .3, y, height * .4, height * .7);
    ctx.fillRect(w - height * .7, y, height * .4, height * .7);
  }
  ctx.restore();
}
