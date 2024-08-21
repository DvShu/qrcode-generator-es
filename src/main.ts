import {
  renderToCanvas,
  QRCodeRender,
  renderToImg,
  renderToSvg,
  renderToTable,
} from "./index";

// 1. canvas
const canvasRender = new QRCodeRender({
  el: "#canvas",
  renderFn: renderToCanvas,
  text: "Hello World!!!",
  size: 100,
  icon: {
    src: "https://static.clewm.net/static/images/favicon.ico",
  },
});
canvasRender.render();

// 2. img
const imgRender = new QRCodeRender({
  el: "#img",
  renderFn: renderToImg,
  text: "Hello World!!!",
  size: 100,
});
imgRender.render();

// 3. svg
const svgRender = new QRCodeRender({
  el: "#svg",
  renderFn: renderToSvg,
  text: "Hello World!!!",
  size: 100,
  icon: {
    src: "https://live.mdnplay.dev/zh-CN/docs/Web/SVG/Element/image/mdn_logo_only_color.png",
  },
  level: "L",
});
svgRender.render();

// 4. table
const tableRender = new QRCodeRender({
  el: "#table",
  renderFn: renderToTable,
  text: "Hello World!!!",
  size: 100,
});
tableRender.render();
