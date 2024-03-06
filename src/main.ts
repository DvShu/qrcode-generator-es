import {
  QRCodeRender,
  renderToSvg,
  renderToTable,
  renderToCanvas,
} from "./index";

const $table = document.getElementById("table");
const qrcode = new QRCodeRender({
  renderFn: renderToCanvas,
  text: "Hello World!!!",
  el: "#canvas",
});
qrcode.render();
// document.getElementById("div").innerHTML = qrcode.render();
// console.log(qrcode.render());
// document.body.appendChild(qrcode.render());
