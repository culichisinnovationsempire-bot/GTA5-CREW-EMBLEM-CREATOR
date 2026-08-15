const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const clearBtn = document.getElementById('clearBtn');
const exportSvgBtn = document.getElementById('exportSvgBtn');
const strokeColorInput = document.getElementById('strokeColor');
const strokeWidthInput = document.getElementById('strokeWidth');
const imageInput = document.getElementById('imageInput');
const svgOutput = document.getElementById('svgOutput');

let drawing = false;
let paths = [];

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  paths.push([{ x, y }]);
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const currentPath = paths[paths.length - 1];
  currentPath.push({ x, y });

  ctx.strokeStyle = strokeColorInput.value;
  ctx.lineWidth = parseFloat(strokeWidthInput.value);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const len = currentPath.length;
  if (len > 1) {
    ctx.moveTo(currentPath[len - 2].x, currentPath[len - 2].y);
    ctx.lineTo(currentPath[len - 1].x, currentPath[len - 1].y);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths = [];
  svgOutput.value = '';
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );

    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(img, x, y, w, h);
  };

  img.src = URL.createObjectURL(file);
});

function generateSVG() {
  const width = canvas.width;
  const height = canvas.height;
  const strokeColor = strokeColorInput.value;
  const strokeWidth = parseFloat(strokeWidthInput.value);

  let svgPaths = '';

  paths.forEach((path) => {
    if (path.length < 2) return;

    let d = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      d += ` L ${path[i].x} ${path[i].y}`;
    }

    svgPaths += `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />\n`;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${svgPaths}</svg>`;
}

exportSvgBtn.addEventListener('click', () => {
  svgOutput.value = generateSVG();
});
