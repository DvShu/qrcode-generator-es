import { QRMode } from "./constants";
import { stringToBytesFuncsUtf8 } from "./qrutil";

export default class BitByte {
	public data: string;
	public mode: number;
	private _bytes: number[];
	public constructor(data: string) {
		this.data = data;
		this.mode = QRMode.MODE_8BIT_BYTE;
		this._bytes = stringToBytesFuncsUtf8(data);
	}

	public getMode() {
		return this.mode;
	}

	public getLength() {
		return this._bytes.length;
	}

	public write(buffer: any) {
		for (let i = 0; i < this._bytes.length; i += 1) {
			buffer.put(this._bytes[i], 8);
		}
	}
}
