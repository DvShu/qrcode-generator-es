import { QRCode } from "./qrcode";
import type { ErrorCorrectionLevel, TypeNumber } from "./types";

/** 二维码渲染的配置项 */
interface QRCodeRenderOption {
	/** 生成的二维码大小 */
	size?: number;
	/** 生成的二维码的外边距 */
	margin?: number;
	/** 二维码渲染的节点 */
	el?: HTMLElement | null;
	/** 二维码内容 */
	text?: string;
	/** 二维码纠错等级, L(默认)、M、Q、H */
	level?: ErrorCorrectionLevel;
	typeNumber?: TypeNumber;
	/** 渲染函数 */
	renderFn: (qrcode: QRCode, option: QRCodeRenderOption) => HTMLElement;
}

function getDefaultOption(option: QRCodeRenderOption): QRCodeRenderOption {
	return {
		size: 100,
		margin: 0,
		typeNumber: 0,
		level: "L",
		...(option || {}),
	};
}

function createElement(el?: HTMLElement | null, tagName = "table") {
	if (el == null) {
		// biome-ignore lint: reason
		el = document.createElement(tagName);
	}
	if (el.tagName !== tagName.toUpperCase()) {
		throw new Error("output and tag are mismatch");
	}
	return el;
}

/** 渲染二维码到表格 */
export function renderToTable(
	qrcode: QRCode,
	option: QRCodeRenderOption,
): HTMLTableElement {
	const $el = createElement(option.el, "table");
	option.el = $el;
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

export function renderToSvg(qrcode: QRCode, option: QRCodeRenderOption) {
	const $el = createElement(option.el, "svg");
	option.el = $el;

	const rectStr = `l${option.size},0 0,${option.size} -${option.size},0 0,-${option.size}z `;

	let svtStr = "";
	svtStr += "";
	svtStr += '<path d="';

	for (let r = 0; r < qrcode.getModuleCount(); r += 1) {
		const mr = r * (option.size as number) + (option.margin as number);
		for (let c = 0; c < qrcode.getModuleCount(); c += 1) {
			if (qrcode.isDark(r, c)) {
				const mc = c * (option.size as number) + (option.margin as number);
				svtStr += `M${mc},${mr}${rectStr}`;
			}
		}
	}
	svtStr += '" stroke="transparent" fill="black"/>';

	$el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	$el.setAttribute("width", `${option.size}px`);
	$el.setAttribute("height", `${option.size}px`);
	$el.setAttribute("viewBox", `0 0 ${option.size} ${option.size}`);
	$el.setAttribute("preserveAspectRatio", "xMinYMin meet");
	$el.setAttribute("role", "img");
	$el.innerHTML = svtStr;
	return $el;
}

/** 二维码渲染 */
export class QRCodeRender {
	public option: QRCodeRenderOption;
	public qrcode: QRCode;

	public constructor(option: QRCodeRenderOption) {
		const opts = getDefaultOption(option);
		this.option = opts;
		this.qrcode = new QRCode(opts.typeNumber, opts.level);
		if (opts.text != null) {
			this.qrcode.addData(opts.text);
			this.qrcode.make();
		}
	}

	public render() {
		return this.option.renderFn(this.qrcode, this.option);
	}

	public addData(data: string) {
		let text = this.option.text || "";
		text = `${text}${data}`;
		return this.resetData(text);
	}

	public resetData(data: string) {
		this.option.text = data;
		this.qrcode.resetData(data);
		this.qrcode.make();
		return this.render();
	}
}
