import { QRErrorCorrectionLevelMap } from "./constants";
import {
	getBCHTypeInfo,
	getBCHTypeNumber,
	getLostPoint,
	getPatternPosition,
} from "./qrutil";
import type { ErrorCorrectionLevel, TypeNumber } from "./types";

export class QRCode {
		public typeNumber: TypeNumber;
		public level: number;
		private _modules: any[][];
		private _moduleCount: number;

		public constructor(
			typeNumber: TypeNumber = 0,
			level: ErrorCorrectionLevel = "M",
		) {
			this.typeNumber = typeNumber;
			this.level = QRErrorCorrectionLevelMap[level];
			this._modules = [];
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

			if (_dataCache == null) {
				_dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
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

		private _createData(typeNumber: number, errorCorrectionLevel: number, dataList) {}
	}
