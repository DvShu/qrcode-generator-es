import qrcodegen from "./qrcodegen";

const $canvas = document.getElementById("canvas") as HTMLCanvasElement;

function drawCanvas(
  qr: qrcodegen.QrCode,
  scale: number,
  border: number,
  lightColor: string,
  darkColor: string,
  canvas: HTMLCanvasElement
): void {
  if (scale <= 0 || border < 0) throw new RangeError("Value out of range");
  const width: number = (qr.size + border * 2) * scale;
  canvas.width = width;
  canvas.height = width;
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  for (let y = -border; y < qr.size + border; y++) {
    for (let x = -border; x < qr.size + border; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
      ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
}

function round(num: number) {
  return Math.floor(num * 100) / 100;
}

function drawCanvas1(
  qr: qrcodegen.QrCode,
  size: number,
  canvas: HTMLCanvasElement,
  foregroundColor = "#000000",
  backgroundColor = "#ffffff"
) {
  const scale = size / qr.size;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? foregroundColor : backgroundColor;
      const startX = Math.floor(x * scale);
      const ceilScale = Math.ceil(scale);
      const startY = Math.floor(y * scale);
      ctx.fillRect(startX, startY, ceilScale, ceilScale);
    }
  }
}

const qr = qrcodegen.QrCode.encodeText(
  "Hello World!!!",
  qrcodegen.QrCode.Ecc.LOW
);

// drawCanvas(qr, 10, 0, "#ffffff", "#000000", $canvas);
drawCanvas1(qr, 500, $canvas);
// import {
//   QRCodeRender,
//   renderToSvg,
//   renderToTable,
//   renderToCanvas,
//   renderToImg,
// } from "./index";

// const $table = document.getElementById("table");
// const qrcode = new QRCodeRender({
//   renderFn: renderToImg,
//   text: "Hello World!!!",
//   el: "#img",
//   fill: "red",
// });
// qrcode.render();
// document.getElementById("div").innerHTML = qrcode.render();
// console.log(qrcode.render());
// document.body.appendChild(qrcode.render());
