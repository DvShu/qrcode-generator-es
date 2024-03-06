import { QRCodeRender, renderToSvg, renderToTable } from "./index";

const $table = document.getElementById("table");
const qrcode = new QRCodeRender({
	renderFn: renderToSvg,
	text: "Hello World!!!",
});
document.body.appendChild(qrcode.render());
