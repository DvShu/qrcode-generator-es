import qrcodegen from "./qrcodegen.js";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type RenderFunction = (qrcode: qrcodegen.QrCode, option: RequiredOption) => HTMLElement;
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
type RequiredOption = Required<Omit<QRCodeRenderOption, "icon">> & Pick<QRCodeRenderOption, "icon">;
export declare function createElement(el?: HTMLElement | null | string, tagName?: string, namespace?: string | null): HTMLElement;
/** 渲染二维码到表格 */
export declare function renderToTable(qrcode: qrcodegen.QrCode, option: RequiredOption): HTMLTableElement;
export declare function renderToSvg(qrcode: qrcodegen.QrCode, option: RequiredOption): HTMLElement;
export declare function renderToCanvas(qr: qrcodegen.QrCode, option: RequiredOption): HTMLCanvasElement;
export declare function renderToImg(qrcode: qrcodegen.QrCode, option: RequiredOption): HTMLImageElement;
/** 二维码渲染 */
export declare class QRCodeRender {
    option: RequiredOption;
    private _defaultOption;
    constructor(option: QRCodeRenderOption);
    /** 渲染二维码 */
    render(): HTMLElement;
    /** 批量修改渲染配置 */
    setOption(option: Partial<QRCodeRenderOption>): void;
    /** 修改渲染配置项 */
    set<K extends keyof QRCodeRenderOption>(key: K, value: QRCodeRenderOption[K]): void;
    /** 添加数据并渲染二维码 */
    addData(data: string): HTMLElement;
    /** 重置二维码 */
    resetData(data: string): HTMLElement;
}
export {};
