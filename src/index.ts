import qrcodegen from "./qrcodegen.js";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

type RenderFunction = (
  qrcode: qrcodegen.QrCode,
  option: RequiredOption
) => HTMLElement;

/** 图标配置 */
interface IconOption {
  /** 	图标大小 */
  size?: number;
  /** 图标地址 */
  src: string;
  image?: HTMLImageElement;
}

/** 二维码渲染的配置项 */
export interface QRCodeRenderOption {
  /** 生成的二维码大小 */
  size?: number;
  /** 二维码渲染的节点 */
  el?: HTMLElement | null | string;
  /** 二维码内容 */
  text?: string | null;
  /** 二维码纠错等级, L(默认)、M、Q、H */
  level?: ErrorCorrectionLevel;
  /** 渲染函数 */
  renderFn: RenderFunction;
  /** 二维码填充颜色 */
  fill?: string;
  /** 二维码背景色 */
  background?: string;
  /** 嵌入图片 */
  icon?: IconOption;
}

type RequiredOption = Required<Omit<QRCodeRenderOption, "icon">> &
  Pick<QRCodeRenderOption, "icon">;

type IconRequiredOption = Required<IconOption>;

function getIconDefault(option: IconOption): IconRequiredOption {
  return {
    size: 40,
    image: null as any,
    ...option,
  };
}

function tableCellStyleString(size: number, background: string) {
  const w = Math.floor(size * 100) / 100;
  const styleObj = {
    width: `${w}px`,
    height: `${w}px`,
    background,
    "border-width": "0px",
    "border-style": "none",
    "border-collapse": "collapse",
    padding: "0px",
    margin: "0px",
  };
  let str = "";
  for (const key in styleObj) {
    str += `${key}:${styleObj[key as "width"]};`;
  }
  return str;
}

function createQrCode(text: string, level: ErrorCorrectionLevel) {
  let ecc = qrcodegen.QrCode.Ecc.LOW;
  if (level === "M") {
    ecc = qrcodegen.QrCode.Ecc.MEDIUM;
  } else if (level === "Q") {
    ecc = qrcodegen.QrCode.Ecc.QUARTILE;
  } else if (level === "H") {
    ecc = qrcodegen.QrCode.Ecc.HIGH;
  }
  return qrcodegen.QrCode.encodeText(text, ecc);
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

function loadImage(
  option: RequiredOption,
  complete: (option: RequiredOption) => void
) {
  if (option.icon != null) {
    const img = new Image();
    img.src = option.icon.src;
    img.onload = () => {
      (option.icon as IconOption).image = img;
      complete(option);
    };
    img.onerror = () => {
      complete(option);
    };
  } else {
    complete(option);
  }
}

/** 渲染二维码到表格 */
export function renderToTable(
  qrcode: qrcodegen.QrCode,
  option: RequiredOption
): HTMLTableElement {
  const $el = createElement(option.el, "table");
  option.el = $el;
  const scale = option.size / qrcode.size;
  $el.style.cssText =
    "border-width:0px;border-style:none;border-collapse:collapse;padding:0px;";
  let qrHtml = "<tbody>";
  for (let r = 0; r < qrcode.size; r++) {
    qrHtml += "<tr>";
    for (let c = 0; c < qrcode.size; c++) {
      const fill = qrcode.getModule(c, r) ? option.fill : option.background;
      const styleStr = tableCellStyleString(scale, fill);
      qrHtml += `<td style="${styleStr}"/>`;
    }
    qrHtml += "</tr>";
  }
  qrHtml += "</tbody>";
  $el.innerHTML = qrHtml;
  return $el as HTMLTableElement;
}

export function renderToSvg(qrcode: qrcodegen.QrCode, option: RequiredOption) {
  const $el = createElement(option.el, "svg", "http://www.w3.org/2000/svg");
  option.el = $el;

  const size = option.size;
  const numCells = qrcode.size;

  const parts: Array<string> = [];
  for (let y = 0; y < numCells; y++) {
    for (let x = 0; x < numCells; x++) {
      if (qrcode.getModule(x, y)) parts.push(`M${x},${y}h1v1h-1z`);
    }
  }

  $el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  $el.setAttribute("width", `${size}px`);
  $el.setAttribute("height", `${size}px`);
  $el.setAttribute("viewBox", `0 0 ${numCells} ${numCells}`);
  $el.setAttribute("preserveAspectRatio", "xMinYMin meet");
  $el.setAttribute("role", "img");
  const partsHtml = [
    `<rect width="100%" height="100%" fill="${option.background}"/>`,
    `<path d="${parts.join(" ")}" fill="${option.fill}"/>`,
  ];
  if (option.icon != null) {
    const iconOpt = getIconDefault(option.icon);
    const scale = numCells / size;
    const iconSize = Math.floor(Math.min(iconOpt.size, size * 0.3) * scale);
    const point = numCells / 2 - iconSize / 2;
    partsHtml.push(
      `<image href="${iconOpt.src}" width="${iconSize}" height="${iconSize}" x="${point}" y="${point}" preserveAspectRatio="none"></image>`
    );
  }
  $el.innerHTML = partsHtml.join("");
  return $el;
}

export function renderToCanvas(qr: qrcodegen.QrCode, option: RequiredOption) {
  const canvas = createElement(option.el, "canvas") as HTMLCanvasElement;
  loadImage(option, (opts) => {
    const scale = opts.size / qr.size;
    canvas.width = opts.size;
    canvas.height = opts.size;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        ctx.fillStyle = qr.getModule(x, y) ? opts.fill : opts.background;
        const startX = Math.floor(x * scale);
        const ceilScale = Math.ceil(scale);
        const startY = Math.floor(y * scale);
        ctx.fillRect(startX, startY, ceilScale, ceilScale);
      }
    }
    if (opts.icon != null && opts.icon.image != null) {
      const iconOpt = getIconDefault(opts.icon);
      const iconSize = Math.floor(Math.min(iconOpt.size, opts.size * 0.3));
      const point = opts.size / 2 - iconSize / 2;
      ctx.drawImage(opts.icon.image, point, point, iconSize, iconSize);
    }
  });

  return canvas;
}

export function renderToImg(qrcode: qrcodegen.QrCode, option: RequiredOption) {
  const $el = createElement(option.el, "img") as HTMLImageElement;
  const opts = { ...option, el: null };
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
  private _defaultOption = {
    size: 100,
    level: "M",
    el: null,
    text: null,
    fill: "#000000",
    background: "#ffffff",
    icon: undefined,
  };

  public constructor(option: QRCodeRenderOption) {
    this.option = { ...this._defaultOption, ...option } as any;
  }

  /** 渲染二维码 */
  public render() {
    const qrcode: qrcodegen.QrCode = createQrCode(
      this.option.text || "",
      this.option.level
    );
    return this.option.renderFn(qrcode, this.option);
  }

  /** 批量修改渲染配置 */
  public setOption(option: Partial<QRCodeRenderOption>) {
    for (const key in option) {
      this.set(key as keyof QRCodeRenderOption, option[key as "text"]);
    }
  }

  /** 修改渲染配置项 */
  public set<K extends keyof QRCodeRenderOption>(
    key: K,
    value: QRCodeRenderOption[K]
  ): void {
    const _v = value ? value : this._defaultOption[key as "text"];
    this.option[key] = _v as never;
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
    return this.render();
  }
}
