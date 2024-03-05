import { QRMode } from "./constants";

export default class QrNumber {
	private _data: any;
	private _mode: number;
	public constructor(data: any) {
		this._data = data;
		this._mode = QRMode.MODE_NUMBER;
	}

	getMode() {
		return this._mode;
	}

	getLength() {
		return this._data.length;
	}

	write(buf: any) {
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
