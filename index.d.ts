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

export type RequiredOption = Required<QRCodeRenderOption & { typeNumber: TypeNumber }>;

/** 0~40之间的数字 */
export type TypeNumber = number;
/**二维码纠错等级 */
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/** 二维码内容 */
export declare class QRCode {
	typeNumber: TypeNumber;
	/** 二维码纠错等级 */
	level: number;
	/**
	 * 构造二维码内容生成
	 * @param level 二维码纠错等级, 默认: L
	 * @param typeNumber 0~40之间的数字, 默认为: 0
	 */
	constructor(typeNumber?: TypeNumber, level?: ErrorCorrectionLevel);
	/**
	 * 添加二维码内容
	 * @param data 二维码内容
	 * @param mode 通常不用设置, 默认: Byte
	 */
	addData(data: string, mode?: string): void;
	/**
	 * 重置二维码内容
	 * @param data 二维码内容
	 * @param mode Byte
	 */
	resetData(data: string, mode?: string): void;
	/**
	 * 二维码数据单元格是否是黑色
	 * @param row 行
	 * @param col 列
	 */
	isDark(row: number, col: number): any;
	/** 获取二维码单元格数量 */
	getModuleCount(): number;
	/** 构造二维码内容 */
	make(): void;
}

/** 渲染二维码到表格 */
export declare function renderToTable(
	qrcode: QRCode,
	option: RequiredOption,
): HTMLTableElement;

/** 渲染二维码到SVG */
export declare function renderToSvg(
	qrcode: QRCode,
	option: RequiredOption,
): SVGAElement;

/** 使用 canvas 绘制二维码 */
export declare function renderToCanvas(
	qrcode: QRCode,
	option: QRCodeRenderOption,
): HTMLCanvasElement;

/** 二维码渲染 */
export declare class QRCodeRender {
	option: RequiredOption;
	qrcode: QRCode;
	constructor(option: QRCodeRenderOption);
	/** 渲染二维码 */
	render(): HTMLElement;
	/** 添加数据并渲染二维码 */
	addData(data: string): HTMLElement;
	/** 重置二维码 */
	resetData(data: string): HTMLElement;
}
