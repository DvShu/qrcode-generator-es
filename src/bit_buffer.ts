export default class BitBuffer {
	private _buffer: number[];
	private _length: number;
	public constructor() {
		this._buffer = [];
		this._length = 0;
	}

	getBuffer() {
		return this._buffer;
	}

	getAt(index: number) {
		const bufIndex = Math.floor(index / 8);
		return ((this._buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
	}

	put(num: number, length: number) {
		for (let i = 0; i < length; i += 1) {
			this.putBit(((num >>> (length - i - 1)) & 1) === 1);
		}
	}

	putBit(bit: boolean) {
		const bufIndex: number = Math.floor(this._length / 8);
		if (this._buffer.length <= bufIndex) {
			this._buffer.push(0);
		}

		if (bit) {
			this._buffer[bufIndex] |= 0x80 >>> (this._length % 8);
		}

		this._length += 1;
	}

	getLengthInBits() {
		return this._length;
	}
}
