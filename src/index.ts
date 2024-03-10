import { QRCode } from "./qrcode";
import type { ErrorCorrectionLevel, TypeNumber } from "./types";

/** 二维码渲染的配置项 */
interface QRCodeRenderOption {
  /** 生成的二维码大小 */
  size?: number;
  /** 生成的二维码的外边距 */
  margin?: number;
  /** 二维码渲染的节点 */
  el?: HTMLElement | null | string;
  /** 二维码内容 */
  text?: string | null;
  /** 二维码纠错等级, L(默认)、M、Q、H */
  level?: ErrorCorrectionLevel;
  /** 渲染函数 */
  renderFn: (qrcode: QRCode, option: RequiredOption) => HTMLElement;
  /** 二维码填充颜色 */
  fill?: string;
}

export type RequiredOption = Required<
  QRCodeRenderOption & { typeNumber: TypeNumber }
>;

function getDefaultOption(option: QRCodeRenderOption): RequiredOption {
  return {
    size: 100,
    margin: 0,
    typeNumber: 0,
    level: "L",
    el: null,
    text: null,
    fill: "#000000",
    ...option,
  };
}

export function createElement(
  el?: HTMLElement | null | string,
  tagName = "table",
  namespace: string | null = null
) {
  if (el == null) {
    if (namespace == null) {
      // biome-ignore lint: reason
      el = document.createElement(tagName);
    } else {
      // biome-ignore lint: reason
      el = document.createElementNS(namespace, tagName) as HTMLElement;
    }
  } else if (typeof el === "string") {
    // biome-ignore lint: reason
    el = document.querySelector<HTMLElement>(el);
  }
  if (el == null) {
    throw new Error("el error");
  }
  if (el.tagName.toUpperCase() !== tagName.toUpperCase()) {
    throw new Error("output and tag are mismatch");
  }
  return el;
}

/**
 * 计算每一块的尺寸
 * @param size 二维码尺寸
 * @param margin 外边距
 * @param moduleCount 模块数量
 * @returns [cellSize, adjustSize] cellSize - 每一块的尺寸, adjustSize - 调整后的尺寸
 */
export function calculateCellsize(
  size: number,
  margin: number,
  moduleCount: number
) {
  const cellSize = Math.floor((size - margin * 2) / moduleCount);
  const adjustSize = moduleCount * cellSize + margin * 2;
  return [cellSize, adjustSize];
}

/** 渲染二维码到表格 */
export function renderToTable(
  qrcode: QRCode,
  option: RequiredOption
): HTMLTableElement {
  const $el = createElement(option.el, "table");
  option.el = $el;
  const margin = option.margin;
  const moduleCount = qrcode.getModuleCount();
  const calcSize = calculateCellsize(option.size, margin, moduleCount);

  $el.style.cssText = `border-width:0px;border-style:none;border-collapse:collapse;padding:0px;margin:${margin}px;`;
  let qrHtml = "<tbody>";
  for (let r = 0; r < moduleCount; r += 1) {
    qrHtml += "<tr>";

    for (let c = 0; c < moduleCount; c += 1) {
      qrHtml += '<td style="';
      qrHtml += "border-width:0px;border-style:none;";
      qrHtml += "border-collapse:collapse;";
      qrHtml += "padding:0px;margin:0px;";
      qrHtml += `width:${calcSize[0]}px;`;
      qrHtml += `height:${calcSize[0]}px;`;
      qrHtml += "background-color: ";
      qrHtml += qrcode.isDark(r, c) ? option.fill : "#ffffff";
      qrHtml += ";";
      qrHtml += '"/>';
    }
    qrHtml += "</tr>";
  }

  qrHtml += "</tbody>";
  $el.innerHTML = qrHtml;
  return $el as HTMLTableElement;
}

export function renderToSvg(qrcode: QRCode, option: RequiredOption) {
  const $el = createElement(option.el, "svg", "http://www.w3.org/2000/svg");
  option.el = $el;

  let size = option.size;
  const margin = option.margin;
  const moduleCount = qrcode.getModuleCount();

  const adjustSize = calculateCellsize(size, margin, moduleCount);
  size = adjustSize[1];

  const rect = `l${adjustSize[0]},0 0,${adjustSize[0]} -${adjustSize[0]},0 0,-${adjustSize[0]}z `;

  let svgStr = "";
  svgStr += '<path d="';

  for (let r = 0; r < qrcode.getModuleCount(); r += 1) {
    const mr = r * adjustSize[0] + margin;
    for (let c = 0; c < qrcode.getModuleCount(); c += 1) {
      if (qrcode.isDark(r, c)) {
        const mc = c * adjustSize[0] + margin;
        svgStr += `M${mc},${mr}${rect}`;
      }
    }
  }
  svgStr += `" stroke="transparent" fill="${option.fill}"/>`;

  $el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  $el.setAttribute("width", `${size}px`);
  $el.setAttribute("height", `${size}px`);
  $el.setAttribute("viewBox", `0 0 ${size} ${size}`);
  $el.setAttribute("preserveAspectRatio", "xMinYMin meet");
  $el.setAttribute("role", "img");
  $el.innerHTML = svgStr;
  return $el;
}

export function renderToCanvas(qrcode: QRCode, option: RequiredOption) {
  const $el = createElement(option.el, "canvas") as HTMLCanvasElement;
  option.el = $el;
  if (option.size <= 0) {
    option.size = $el.width;
  }
  const length = qrcode.getModuleCount();
  const adjustSize = calculateCellsize(option.size, option.margin, length);
  const cellSize = adjustSize[0];
  const ctx = $el.getContext("2d") as CanvasRenderingContext2D;
  $el.width = adjustSize[1];
  $el.height = adjustSize[1];

  for (let row = 0; row < length; row++) {
    for (let col = 0; col < length; col++) {
      ctx.fillStyle = qrcode.isDark(row, col) ? option.fill : "white";
      ctx.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
    }
  }
  return $el;
}

export function renderToImg(qrcode: QRCode, option: RequiredOption) {
  const $el = createElement(option.el, "img") as HTMLImageElement;
  let opts = { ...option, el: null };
  const $canvas = renderToCanvas(qrcode, opts);
  $el.style.width = `${$canvas.width}px`;
  $el.style.height = `${$canvas.height}px`;
  $el.src = $canvas.toDataURL("image/png");
  option.el = $el;
  return $el;
}

/** 二维码渲染 */
export class QRCodeRender {
  public option: RequiredOption;
  public qrcode: QRCode;

  public constructor(option: QRCodeRenderOption) {
    const opts = getDefaultOption(option);
    this.option = opts;
    this.qrcode = new QRCode(opts.level, opts.typeNumber);
    if (opts.text != null) {
      this.qrcode.addData(opts.text);
      this.qrcode.make();
    }
  }

  /** 渲染二维码 */
  public render() {
    return this.option.renderFn(this.qrcode, this.option);
  }

  /** 添加数据并渲染二维码 */
  public addData(data: string) {
    let text = this.option.text || "";
    text = `${text}${data}`;
    return this.resetData(text);
  }

  /** 重置二维码 */
  public resetData(data: string) {
    this.option.text = data;
    this.qrcode.resetData(data);
    this.qrcode.make();
    return this.render();
  }
}
