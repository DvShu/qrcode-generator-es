import BitBuffer from "./bit_buffer";
import { QRErrorCorrectionLevelMap } from "./constants";
import QrNumber from "./qr_number";
import QrPolynomial from "./qr_polynomial";
import QRRSBlock from "./qrrs_block";
import {
	getBCHTypeInfo,
	getBCHTypeNumber,
	getErrorCorrectPolynomial,
	getLengthInBits,
	getLostPoint,
	getPatternPosition,
} from "./qrutil";
import type { ErrorCorrectionLevel, TypeNumber } from "./types";

const PAD0 = 0xec;
const PAD1 = 0x11;

export class QRCode {
	public typeNumber: TypeNumber;
	public level: number;
	private _modules: any[][];
	private _moduleCount: number;
	private _dataList: QrNumber[];
	private _dataCache: number[] | null;

	public constructor(
		typeNumber: TypeNumber = 0,
		level: ErrorCorrectionLevel = "M",
	) {
		this.typeNumber = typeNumber;
		this.level = QRErrorCorrectionLevelMap[level];
		this._modules = [];
		this._dataList = [];
		this._dataCache = null;
		this._moduleCount = this.typeNumber * 4 + 17;
	}

	private _makeImpl(test: boolean, maskPattern: number) {
		this._moduleCount = this.typeNumber * 4 + 17;
		this._modules = this._makeModules(this._moduleCount);
		this._setupPositionProbePattern(0, 0);
		this._setupPositionProbePattern(this._moduleCount - 7, 0);
		this._setupPositionProbePattern(0, this._moduleCount - 7);
		this._setupPositionAdjustPattern();
		this._setupTimingPattern();
		this._setupTypeInfo(test, maskPattern);

		if (this.typeNumber >= 7) {
			this._setupTypeNumber(test);
		}

		if (this._dataCache == null) {
			this._dataCache = this._createData(
				this.typeNumber,
				this.level,
				this._dataList,
			);
		}
	}

	private _makeModules(moduleCount: number) {
		const modules: any[][] = new Array(moduleCount);
		for (let row = 0; row < moduleCount; row += 1) {
			modules[row] = new Array(moduleCount);
			for (let col = 0; col < moduleCount; col += 1) {
				modules[row][col] = null;
			}
		}
		return modules;
	}

	private _setupPositionProbePattern(row: number, col: number) {
		for (let r = -1; r <= 7; r += 1) {
			if (row + r <= -1 || this._moduleCount <= row + r) continue;

			for (let c = -1; c <= 7; c += 1) {
				if (col + c <= -1 || this._moduleCount <= col + c) continue;

				if (
					(0 <= r && r <= 6 && (c === 0 || c === 6)) ||
					(0 <= c && c <= 6 && (r === 0 || r === 6)) ||
					(2 <= r && r <= 4 && 2 <= c && c <= 4)
				) {
					this._modules[row + r][col + c] = true;
				} else {
					this._modules[row + r][col + c] = false;
				}
			}
		}
	}

	private _setupPositionAdjustPattern() {
		const pos = getPatternPosition(this.typeNumber);

		for (let i = 0; i < pos.length; i += 1) {
			for (let j = 0; j < pos.length; j += 1) {
				const row = pos[i];
				const col = pos[j];

				if (this._modules[row][col] != null) {
					continue;
				}

				for (let r = -2; r <= 2; r += 1) {
					for (let c = -2; c <= 2; c += 1) {
						if (
							r === -2 ||
							r === 2 ||
							c === -2 ||
							c === 2 ||
							(r === 0 && c === 0)
						) {
							this._modules[row + r][col + c] = true;
						} else {
							this._modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	}

	private _getBestMaskPattern() {
		let minLostPoint = 0;
		let pattern = 0;

		for (let i = 0; i < 8; i += 1) {
			this._makeImpl(true, i);

			const lostPoint = getLostPoint(this);

			if (i === 0 || minLostPoint > lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}

		return pattern;
	}

	private _setupTimingPattern() {
		for (let r = 8; r < this._moduleCount - 8; r += 1) {
			if (this._modules[r][6] != null) {
				continue;
			}
			this._modules[r][6] = r % 2 === 0;
		}

		for (let c = 8; c < this._moduleCount - 8; c += 1) {
			if (this._modules[6][c] != null) {
				continue;
			}
			this._modules[6][c] = c % 2 === 0;
		}
	}

	private _setupTypeNumber(test: boolean) {
		const bits = getBCHTypeNumber(this.typeNumber);

		for (let i = 0; i < 18; i += 1) {
			const mod = !test && ((bits >> i) & 1) === 1;
			this._modules[Math.floor(i / 3)][(i % 3) + this._moduleCount - 8 - 3] =
				mod;
		}

		for (let i = 0; i < 18; i += 1) {
			const mod = !test && ((bits >> i) & 1) === 1;
			this._modules[(i % 3) + this._moduleCount - 8 - 3][Math.floor(i / 3)] =
				mod;
		}
	}

	private _setupTypeInfo(test: boolean, maskPattern: number) {
		const data = (this.level << 3) | maskPattern;
		const bits = getBCHTypeInfo(data);

		// vertical
		for (let i = 0; i < 15; i += 1) {
			const mod = !test && ((bits >> i) & 1) === 1;

			if (i < 6) {
				this._modules[i][8] = mod;
			} else if (i < 8) {
				this._modules[i + 1][8] = mod;
			} else {
				this._modules[this._moduleCount - 15 + i][8] = mod;
			}
		}

		// horizontal
		for (let i = 0; i < 15; i += 1) {
			const mod = !test && ((bits >> i) & 1) === 1;

			if (i < 8) {
				this._modules[8][this._moduleCount - i - 1] = mod;
			} else if (i < 9) {
				this._modules[8][15 - i - 1 + 1] = mod;
			} else {
				this._modules[8][15 - i - 1] = mod;
			}
		}

		// fixed module
		this._modules[this._moduleCount - 8][8] = !test;
	}

	private _createData(
		typeNumber: number,
		errorCorrectionLevel: number,
		dataList: QrNumber[],
	) {
		const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

		const buffer = new BitBuffer();

		for (let i = 0; i < dataList.length; i += 1) {
			const data = dataList[i];
			buffer.put(data.getMode(), 4);
			buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber));
			data.write(buffer);
		}

		// calc num max data.
		let totalDataCount = 0;
		for (let i = 0; i < rsBlocks.length; i += 1) {
			totalDataCount += rsBlocks[i].dataCount;
		}

		if (buffer.getLengthInBits() > totalDataCount * 8) {
			throw `code length overflow. (${buffer.getLengthInBits()}>${
				totalDataCount * 8
			})`;
		}

		if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
			// end code
			buffer.put(0, 4);
		}

		// padding
		while (buffer.getLengthInBits() % 8 !== 0) {
			buffer.putBit(false);
		}

		// padding
		while (true) {
			if (buffer.getLengthInBits() >= totalDataCount * 8) {
				break;
			}
			buffer.put(PAD0, 8);

			if (buffer.getLengthInBits() >= totalDataCount * 8) {
				break;
			}
			buffer.put(PAD1, 8);
		}

		return this._createBytes(buffer, rsBlocks);
	}

	private _createBytes(buffer: BitBuffer, rsBlocks: QRRSBlock[]): number[] {
		let offset = 0;

		let maxDcCount = 0;
		let maxEcCount = 0;

		const dcdata = new Array(rsBlocks.length);
		const ecdata = new Array(rsBlocks.length);

		for (let r = 0; r < rsBlocks.length; r += 1) {
			const dcCount = rsBlocks[r].dataCount;
			const ecCount = rsBlocks[r].totalCount - dcCount;

			maxDcCount = Math.max(maxDcCount, dcCount);
			maxEcCount = Math.max(maxEcCount, ecCount);

			dcdata[r] = new Array(dcCount);

			for (let i = 0; i < dcdata[r].length; i += 1) {
				dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
			}
			offset += dcCount;

			const rsPoly = getErrorCorrectPolynomial(ecCount);
			const rawPoly = new QrPolynomial(dcdata[r], rsPoly.getLength() - 1);

			const modPoly = rawPoly.mod(rsPoly);
			ecdata[r] = new Array(rsPoly.getLength() - 1);
			for (let i = 0; i < ecdata[r].length; i += 1) {
				const modIndex = i + modPoly.getLength() - ecdata[r].length;
				ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
			}
		}

		let totalCodeCount = 0;
		for (let i = 0; i < rsBlocks.length; i += 1) {
			totalCodeCount += rsBlocks[i].totalCount;
		}

		const data = new Array(totalCodeCount);
		let index = 0;

		for (let i = 0; i < maxDcCount; i += 1) {
			for (let r = 0; r < rsBlocks.length; r += 1) {
				if (i < dcdata[r].length) {
					data[index] = dcdata[r][i];
					index += 1;
				}
			}
		}

		for (let i = 0; i < maxEcCount; i += 1) {
			for (let r = 0; r < rsBlocks.length; r += 1) {
				if (i < ecdata[r].length) {
					data[index] = ecdata[r][i];
					index += 1;
				}
			}
		}

		return data;
	}
}
