export default function recolorImage(img: HTMLImageElement) {
  const froNoLowRed = 93; // frozen, little/no runoff
  const froNoLowGreen = 173; // frozen, little/no runoff
  const froNoLowBlue = 226; // frozen, little/no runoff
  const froHighRed = 142; // frozen, high runoff
  const froHighGreen = 68; // frozen, high runoff
  const froHighBlue = 173; // frozen, high runoff
  const noLowRed = 82; // little/no runoff
  const noLowGreen = 190; // little/no runoff
  const noLowBlue = 128; // little/no runoff
  const highRed = 255; // high runoff
  const highGreen = 0; // high runoff
  const highBlue = 0; // high runoff

  const c = document.getElementById('canvasId') as HTMLCanvasElement;
  const ctx = c.getContext('2d');
  const w = img.width;
  const h = img.height;

  c.width = w;
  c.height = h;

  if (ctx) {
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (
        imageData.data[i] === froNoLowRed &&
        imageData.data[i + 1] === froNoLowGreen &&
        imageData.data[i + 2] === froNoLowBlue
      ) {
        imageData.data[i] = noLowRed;
        imageData.data[i + 1] = noLowGreen;
        imageData.data[i + 2] = noLowBlue;
      } else if (
        imageData.data[i] === froHighRed &&
        imageData.data[i + 1] === froHighGreen &&
        imageData.data[i + 2] === froHighBlue
      ) {
        imageData.data[i] = highRed;
        imageData.data[i + 1] = highGreen;
        imageData.data[i + 2] = highBlue;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
