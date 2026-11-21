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

export function drawGrain(context, width, height, strength) {
  context.save();
  context.globalAlpha = 0.09 * Math.max(0, strength);
  for (let y = 0; y < height; y += 12) {
    for (let x = 0; x < width; x += 12) {
      const noise = ((x * 17 + y * 31) % 101) / 101;
      if (noise > 0.52) {
        context.fillStyle = noise > 0.77 ? '#fff' : '#100c23';
        context.fillRect(x, y, 2 + noise * 3, 2 + noise * 3);
      }
    }
  }
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
