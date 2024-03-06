import { QRMode } from "./constants";
import { stringToBytesFuncsUtf8 } from "./qrutil";

class Data {
	protected _data: string;
	protected _mode: number;

	public constructor(data: any, mode: number = QRMode.MODE_8BIT_BYTE) {
		this._data = data;
		this._mode = mode;
	}

	public getMode(): number {
		return this._mode;
	}

	public getLength(): number {
		return this._data.length;
	}

	public write(_buffer: any) {}
}

export class BitByte extends Data {
	public constructor(data: string) {
		super(stringToBytesFuncsUtf8(data), QRMode.MODE_8BIT_BYTE);
	}

	public write(buffer: any) {
		for (let i = 0; i < this._data.length; i += 1) {
			buffer.put(this._data[i], 8);
		}
	}
}

export class QrNumber extends Data {
	public constructor(data: string) {
		super(data, QRMode.MODE_NUMBER);
	}

	public write(buf: any) {
		const data = this._data;

		let i = 0;

		while (i + 2 < data.length) {
			buf.put(this._strToNum(data.substring(i, i + 3)), 10);
			i += 3;
		}

		if (i < data.length) {
			if (data.length - i === 1) {
				buf.put(this._strToNum(data.substring(i, i + 1)), 4);
			} else if (data.length - i === 2) {
				buf.put(this._strToNum(data.substring(i, i + 2)), 7);
			}
		}
	}

	private _strToNum(s: string) {
		let num = 0;
		for (let i = 0; i < s.length; i += 1) {
			num = num * 10 + this._chatToNum(s.charAt(i));
		}
		return num;
	}

	private _chatToNum(c: string) {
		if ("0" <= c && c <= "9") {
			return c.charCodeAt(0) - "0".charCodeAt(0);
		}
		throw `illegal char :${c}`;
	}
}
