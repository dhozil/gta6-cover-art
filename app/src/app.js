import { render, regions } from './cover-art.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#poster');
const state = {
  width: 1080,
  height: 1350,
  caption: $('#caption').value,
  strap: $('#strap').value,
  grade: 'sunset',
  grain: 1,
  scanlines: 1,
  vignette: 1,
  lightLeak: 0,
  panels: [],
  selected: 0,
};

async function loadImage(source) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not load image: ${source}`);

  const imageUrl = URL.createObjectURL(await response.blob());
  const image = new Image();
  image.src = imageUrl;
  try {
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function makePanel(image) {
  return { image, x: 0, y: 0, zoom: 1, fit: false };
}

const samplePhotos = await Promise.all(
  ['pier', 'boulevard'].map((name) => loadImage(`./samples/${name}.jpg`)),
);
state.panels = [makePanel(samplePhotos[1]), makePanel(samplePhotos[0]), makePanel(samplePhotos[1])];

function drawPoster() {
  render(canvas, state);
  $('#dimensions').textContent = `${state.width} × ${state.height}`;
}

function renderPanelList() {
  const list = $('#panels');
  list.replaceChildren();

  state.panels.forEach((panel, index) => {
    const row = document.createElement('div');
    row.className = 'panel';

    const select = document.createElement('button');
    select.textContent = `${String(index + 1).padStart(2, '0')} / Scene`;
    select.className = index === state.selected ? 'active' : '';
    select.onclick = () => {
      state.selected = index;
      $('#zoom').value = panel.zoom;
      renderPanelList();
    };
    row.append(select);

    const moveUp = document.createElement('button');
    moveUp.textContent = '↑';
    moveUp.setAttribute('aria-label', `Move scene ${index + 1} up`);
    moveUp.onclick = () => {
      if (index > 0) {
        [state.panels[index - 1], state.panels[index]] = [panel, state.panels[index - 1]];
        state.selected = index - 1;
        renderPanelList();
        drawPoster();
      }
    };
    row.append(moveUp);

    const remove = document.createElement('button');
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove scene ${index + 1}`);
    remove.onclick = () => {
      if (state.panels.length > 1) {
        state.panels.splice(index, 1);
        state.selected = 0;
        renderPanelList();
        drawPoster();
      }
    };
    row.append(remove);
    list.append(row);
  });
}

for (const field of ['caption', 'strap', 'grade']) {
  $(`#${field}`).oninput = (event) => {
    state[field] = event.target.value;
    drawPoster();
  };
}

$('#zoom').oninput = (event) => {
  state.panels[state.selected].zoom = Number(event.target.value);
  drawPoster();
};

$('#fit').onclick = () => {
  const panel = state.panels[state.selected];
  panel.fit = !panel.fit;
  drawPoster();
};

$('#add').onclick = () => {
  if (state.panels.length < 4) {
    state.panels.push(makePanel(state.panels[state.selected].image));
    state.selected = state.panels.length - 1;
    renderPanelList();
    drawPoster();
  }
};

$('#pier').onclick = () => {
  state.panels[state.selected] = makePanel(samplePhotos[0]);
  drawPoster();
};
$('#boulevard').onclick = () => {
  state.panels[state.selected] = makePanel(samplePhotos[1]);
  drawPoster();
};

$('#upload').onchange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  try {
    state.panels[state.selected] = makePanel(await loadImage(objectUrl));
    drawPoster();
  } catch {
    alert('Please choose a readable image.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

document.querySelectorAll('[data-size]').forEach((button) => {
  button.onclick = () => {
    [state.width, state.height] = button.dataset.size.split(',').map(Number);
    drawPoster();
  };
});

const shortcuts = { colour: 's', export: 'e' };
$('#shortcut-hint').textContent = [
  ...Array.from(document.querySelectorAll('[data-shortcut]'), (button) =>
    `${button.dataset.shortcut} ${button.textContent.split(' \u00b7 ')[0]}`),
  `${shortcuts.colour.toUpperCase()} Colour treatment`,
  `${shortcuts.export.toUpperCase()} Export PNG in new tab`,
].join(' \u00b7 ');

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat ||
      event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const size = /^[123]$/.test(key) && document.querySelector(`[data-shortcut="${key}"]`);
  if (size) size.click();
  else if (key === shortcuts.colour) {
    const grades = ['sunset', 'neon', 'gold'];
    $('#grade').value = grades[(grades.indexOf(state.grade) + 1) % grades.length];
    $('#grade').dispatchEvent(new Event('input'));
  } else if (key === shortcuts.export) {
    const tab = window.open('about:blank', '_blank');
    if (tab) exportCover(false).then((url) => {
      const image = tab.document.createElement('img');
      image.src = url;
      image.style.maxWidth = '100%';
      tab.document.body.append(image);
    });
  } else return;
  event.preventDefault();
});

let dragPoint = null;
canvas.onpointerdown = (event) => {
  const bounds = canvas.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  state.selected = regions(state.panels.length).findIndex(([left, top, width, height]) =>
    x >= left && x <= left + width && y >= top && y <= top + height,
  );
  if (state.selected < 0) state.selected = 0;
  dragPoint = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
  renderPanelList();
};
canvas.onpointermove = (event) => {
  if (!dragPoint) return;
  const bounds = canvas.getBoundingClientRect();
  const panel = state.panels[state.selected];
  panel.x += ((event.clientX - dragPoint.x) * state.width) / bounds.width;
  panel.y += ((event.clientY - dragPoint.y) * state.height) / bounds.height;
  dragPoint = { x: event.clientX, y: event.clientY };
  drawPoster();
};
canvas.onpointerup = () => { dragPoint = null; };
canvas.onpointercancel = () => { dragPoint = null; };
canvas.onwheel = (event) => {
  event.preventDefault();
  const panel = state.panels[state.selected];
  panel.zoom = Math.max(1, Math.min(4, panel.zoom - event.deltaY * 0.002));
  $('#zoom').value = panel.zoom;
  drawPoster();
};

function createPngBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function blobAsDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function exportCover(download = true) {
  const blob = await createPngBlob();
  if (!blob) throw new Error('The browser could not encode this cover as PNG.');
  const dataUrl = await blobAsDataUrl(blob);
  const exportedImage = new Image();
  exportedImage.id = 'exported-cover';
  exportedImage.src = dataUrl;
  $('#result').replaceChildren(exportedImage);

  if (download) {
    const link = document.createElement('a');
    link.download = `cover-${state.width}x${state.height}.png`;
    const downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
  }
  return dataUrl;
}

$('#export').onclick = () => exportCover();
window.coverStudio = { state, draw: drawPoster, exportCover };


for (const field of ["grain", "scanlines", "vignette"]) {
  document.getElementById(field).oninput = (event) => {
    state[field] = Number(event.target.value);
    drawPoster();
  };
}

const query = new URLSearchParams(location.search);
if (query.has('size')) {
  [state.width, state.height] = query.get('size').split('x').map(Number);
}
renderPanelList();
drawPoster();

if (query.has('cover')) {
  const cover = document.createElement('img');
  cover.id = 'exported-cover';
  cover.src = canvas.toDataURL('image/png');
  document.body.className = 'cover';
  document.body.replaceChildren(cover);
}
