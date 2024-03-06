import { QRCode } from "./qrcode";
import type { ErrorCorrectionLevel, TypeNumber } from "./types";

interface QRCodeRenderOption {
	/** 生成的二维码尺寸 */
	size?: number;
	margin?: number;
	el?: HTMLElement;
	output?: string;
	text: string;
	level?: ErrorCorrectionLevel;
	typeNumber?: TypeNumber;
}

function getDefaultOption(option: QRCodeRenderOption): QRCodeRenderOption {
	return {
		size: 100,
		margin: 0,
		output: "table",
		typeNumber: 0,
		level: "L",
		...(option || {}),
	};
}

function renderToTable(
	qrcode: QRCode,
	option: QRCodeRenderOption,
): HTMLTableElement {
	let $el = option.el;
	if ($el == null) {
		$el = document.createElement("table");
	}
	const itemSize = Math.floor(
		(option.size as number) / qrcode.getModuleCount(),
	);
	$el.style.cssText = `border-width:0px;border-style:none;border-collapse:collapse;padding:0px;margin:${option.margin}px;`;
	let qrHtml = "<tbody>";
	for (let r = 0; r < qrcode.getModuleCount(); r += 1) {
		qrHtml += "<tr>";

		for (let c = 0; c < qrcode.getModuleCount(); c += 1) {
			qrHtml += '<td style="';
			qrHtml += "border-width:0px;border-style:none;";
			qrHtml += "border-collapse:collapse;";
			qrHtml += "padding:0px;margin:0px;";
			qrHtml += `width:${itemSize}px;`;
			qrHtml += `height:${itemSize}px;`;
			qrHtml += "background-color: ";
			qrHtml += qrcode.isDark(r, c) ? "#000000" : "#ffffff";
			qrHtml += ";";
			qrHtml += '"/>';
		}

		qrHtml += "</tr>";
	}

	qrHtml += "</tbody>";
	$el.innerHTML = qrHtml;
	return $el as HTMLTableElement;
}

export function render(option: QRCodeRenderOption) {
	const opts = getDefaultOption(option);
	const qrcode = new QRCode(opts.typeNumber, opts.level);
	qrcode.addData(opts.text, "Numeric");
	qrcode.make();

	if (opts.output === "table") {
		return renderToTable(qrcode, opts);
	}
}
