import { drawGrain, drawScanlines, drawVignette, drawLightLeak, drawLetterbox, drawTapeEdge } from './effects.js';

const layouts = {
  1: [[ [0.04, 0.20], [0.96, 0.16], [0.94, 0.78], [0.06, 0.76] ]],
  2: [
    [[0.04, 0.20], [0.53, 0.18], [0.50, 0.78], [0.05, 0.76]],
    [[0.53, 0.18], [0.96, 0.20], [0.95, 0.76], [0.50, 0.78]],
  ],
  3: [
    [[0.04, 0.20], [0.55, 0.18], [0.51, 0.48], [0.05, 0.50]],
    [[0.55, 0.18], [0.96, 0.20], [0.95, 0.49], [0.51, 0.48]],
    [[0.05, 0.50], [0.51, 0.48], [0.95, 0.49], [0.96, 0.78], [0.04, 0.78]],
  ],
  4: [
    [[0.04, 0.20], [0.53, 0.18], [0.51, 0.48], [0.05, 0.50]],
    [[0.53, 0.18], [0.96, 0.20], [0.95, 0.49], [0.51, 0.48]],
    [[0.05, 0.50], [0.51, 0.48], [0.50, 0.78], [0.04, 0.77]],
    [[0.51, 0.48], [0.95, 0.49], [0.96, 0.78], [0.50, 0.78]],
  ],
};

export function regions(count) {
  return layouts[count] || layouts[3];
}

function tracePolygon(context, points, width, height) {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x * width, y * height);
    else context.lineTo(x * width, y * height);
  });
  context.closePath();
}

export function drawGradientSky(context, width, height, grade) {
  const palettes = {
    sunset: ['#301942', '#ef5475', '#ffb16c'],
    neon: ['#070e32', '#6045aa', '#12b8bb'],
    gold: ['#372640', '#d86653', '#f4c77e'],
  };
  const colors = palettes[grade] || palettes.sunset;
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, colors[0]);
  sky.addColorStop(0.54, colors[1]);
  sky.addColorStop(1, colors[2]);
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  const sunsetGlow = context.createRadialGradient(
    width * 0.77, height * 0.25, 0, width * 0.77, height * 0.25, width * 0.34,
  );
  sunsetGlow.addColorStop(0, '#ffd58a99');
  sunsetGlow.addColorStop(0.3, '#ff86a644');
  sunsetGlow.addColorStop(1, '#ff779900');
  context.fillStyle = sunsetGlow;
  context.fillRect(0, 0, width, height);
}

export function drawSilhouetteSkyline(context, width, height) {
  const skylineBase = height * 0.47;
  context.fillStyle = '#17182b';
  context.beginPath();
  context.moveTo(0, skylineBase + 40);
  for (let x = 0; x <= width; x += 44) {
    const buildingHeight = 26 + ((x * 19) % 91);
    context.lineTo(x, skylineBase - buildingHeight);
    context.lineTo(x + 20, skylineBase - buildingHeight);
    context.lineTo(x + 20, skylineBase + 40);
  }
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.fill();

  context.fillStyle = '#ffb47666';
  for (let x = 15; x < width; x += 51) {
    for (let y = skylineBase - 52; y < skylineBase + 20; y += 22) {
      context.fillRect(x, y, 4, 7);
    }
  }
}

export function drawPanel(context, panel, points, width, height, index) {
  tracePolygon(context, points, width, height);
  context.save();
  context.clip();

  const xs = points.map(([x]) => x * width);
  const ys = points.map(([, y]) => y * height);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const panelWidth = Math.max(...xs) - left;
  const panelHeight = Math.max(...ys) - top;
  context.fillStyle = '#18172b';
  context.fillRect(left, top, panelWidth, panelHeight);

  if (panel.image) {
    const image = panel.image;
    const coverScale = Math.max(panelWidth / image.width, panelHeight / image.height);
    const fitScale = Math.min(panelWidth / image.width, panelHeight / image.height);
    const scale = (panel.fit ? fitScale : coverScale) * panel.zoom;
    const imageWidth = image.width * scale;
    const imageHeight = image.height * scale;
    context.drawImage(
      image,
      left + (panelWidth - imageWidth) / 2 + panel.x,
      top + (panelHeight - imageHeight) / 2 + panel.y,
      imageWidth,
      imageHeight,
    );
  }

  const colorGrade = context.createLinearGradient(0, top, 0, top + panelHeight);
  colorGrade.addColorStop(0, '#17204444');
  colorGrade.addColorStop(0.55, '#fa637022');
  colorGrade.addColorStop(1, '#10152cbb');
  context.fillStyle = colorGrade;
  context.fillRect(left, top, panelWidth, panelHeight);
  context.fillStyle = '#ffc1a933';
  context.fillRect(left, top, panelWidth * 0.09, panelHeight);
  context.restore();

  context.save();
  tracePolygon(context, points, width, height);
  context.strokeStyle = '#ffe3c4';
  context.lineWidth = Math.max(3, width * 0.003);
  context.stroke();
  context.restore();

  context.save();
  tracePolygon(context, points, width, height);
  context.clip();
  context.fillStyle = '#fff2d4';
  context.font = `900 ${Math.max(20, width * 0.021)}px Arial`;
  const sceneNames = ['01 / OCEAN DRIVE', '02 / THE STRIP', '03 / NO CURFEW', '04 / AFTER DARK'];
  context.fillText(sceneNames[index] || '05 / LAST CALL', left + panelWidth * 0.055, top + panelHeight * 0.90);
  context.restore();
}

export function drawCaption(context, text, width, height) {
  const lines = String(text || '').toUpperCase().split(/\r?\n/).slice(0, 3);
  const baseSize = height * 0.064;
  context.save();
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';

  let y = height * 0.83;
  for (const line of lines) {
    let size = baseSize;
    context.font = `1000 ${size}px Impact, "Arial Black", sans-serif`;
    while (context.measureText(line).width > width * 0.90 && size > 16) {
      size *= 0.92;
      context.font = `1000 ${size}px Impact, "Arial Black", sans-serif`;
    }
    context.shadowColor = '#231325';
    context.shadowBlur = width * 0.012;
    context.shadowOffsetY = width * 0.008;
    context.lineWidth = Math.max(5, width * 0.009);
    context.strokeStyle = '#30172d';
    context.strokeText(line, width / 2, y, width * 0.92);
    context.shadowColor = '#fff0';
    context.fillStyle = '#fff1d3';
    context.fillText(line, width / 2, y, width * 0.92);
    context.lineWidth = Math.max(1, width * 0.0015);
    context.strokeStyle = '#f78a89';
    context.strokeText(line, width / 2, y, width * 0.92);
    y += baseSize * 0.84;
  }
  context.restore();
}

export function drawMasthead(context, width, height, strap) {
  context.save();
  context.textAlign = 'center';
  context.fillStyle = '#ffe7c5';
  context.shadowColor = '#ff7c8b';
  context.shadowBlur = width * 0.015;
  const mastheadSize = Math.min(width * 0.066, height * 0.09);
  context.font = `900 ${mastheadSize}px Impact, "Arial Black", sans-serif`;
  context.fillText('NEON COUNTY', width / 2, height * 0.105);

  context.shadowBlur = 0;
  context.font = `700 ${width * 0.014}px Arial`;
  context.letterSpacing = `${width * 0.004 + 2}px`;
  context.fillStyle = '#ffb4a3';
  context.fillText(String(strap || 'GOOD NIGHTS. BAD DECISIONS.').toUpperCase(), width / 2, height * 0.14);

  context.textAlign = 'left';
  context.fillStyle = '#fff0d2';
  context.font = `bold ${width * 0.012}px Arial`;
  context.fillText('A SUNSET STATE STORY', width * 0.055, height * 0.175);
  context.textAlign = 'right';
  context.fillText('VOL. 06 / 2026', width * 0.945, height * 0.175);
  context.restore();
}

export function render(canvas, state) {
  const { width, height } = state;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  drawGradientSky(context, width, height, state.grade);
  drawSilhouetteSkyline(context, width, height);
  const panelPolygons = regions(state.panels.length);
  state.panels.forEach((panel, index) => {
    drawPanel(context, panel, panelPolygons[index], width, height, index);
  });
  drawMasthead(context, width, height, state.strap);
  drawCaption(context, state.caption, width, height);
  drawVignette(context, width, height, state.vignette ?? 1);
  context.save();
  context.strokeStyle = '#ffdfbd77';
  context.lineWidth = width * 0.004;
  context.strokeRect(width * 0.025, height * 0.018, width * 0.95, height * 0.964);
  context.fillStyle = '#ffd9b8';
  context.font = `bold ${width * 0.009}px Arial`;
  context.fillText('◆  NC / ORIGINAL SERIES', width * 0.065, height * 0.955);
  context.restore();
  // Letterbox and grain are drawn last so every panel keeps its crisp edge.
  drawGrain(context, width, height, state.grain ?? 1);
  drawScanlines(context, width, height, state.scanlines ?? 1, "#fff");
  drawLightLeak(context, width, height, state.lightLeak ?? 0, "#ffb476");
  drawLetterbox(context, width, height, 0.015);
  drawTapeEdge(context, width, height, width * 0.02);
}

