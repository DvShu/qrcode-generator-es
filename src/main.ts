import {
  QRCodeRender,
  renderToSvg,
  renderToTable,
  renderToCanvas,
  renderToImg,
} from "./index";

const $table = document.getElementById("table");
const qrcode = new QRCodeRender({
  renderFn: renderToImg,
  text: "Hello World!!!",
  el: "#img",
  fill: "red",
});
qrcode.render();
// document.getElementById("div").innerHTML = qrcode.render();
// console.log(qrcode.render());
// document.body.appendChild(qrcode.render());
