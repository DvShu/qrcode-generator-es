import BitBuffer from "./bit_buffer";
import { QRErrorCorrectionLevelMap } from "./constants";
import { BitByte, QrNumber } from "./data";
import QrPolynomial from "./qr_polynomial";
import QRRSBlock from "./qrrs_block";
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
  getMaskFunction,
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
    level: ErrorCorrectionLevel = "L",
    typeNumber: TypeNumber = 0
  ) {
    this.typeNumber = typeNumber;
    this.level = QRErrorCorrectionLevelMap[level];
    this._modules = [];
    this._dataList = [];
    this._dataCache = null;
    this._moduleCount = this.typeNumber * 4 + 17;
  }

  public addData(data: string, mode?: string) {
    // biome-ignore lint: reason
    mode = mode || "Byte";

    let newData: any = null;

    switch (mode) {
      case "Numeric":
        newData = new QrNumber("0000");
        break;
      case "Alphanumeric":
        // newData = qrAlphaNum(data);
        newData = new BitByte(data);
        break;
      case "Byte":
        newData = new BitByte(data);
        break;
      case "Kanji":
        // newData = qrKanji(data);
        newData = new BitByte(data);
        break;
      default:
        throw `mode:${mode}`;
    }

    this._dataList.push(newData);
    this._dataCache = null;
  }

  public resetData(data: string, mode?: string) {
    this.typeNumber = 0;
    this._dataList = [];
    this._dataCache = null;
    this.addData(data, mode);
  }

  public isDark(row: number, col: number) {
    if (
      row < 0 ||
      this._moduleCount <= row ||
      col < 0 ||
      this._moduleCount <= col
    ) {
      throw `${row},${col}`;
    }
    return this._modules[row][col];
  }

  public getModuleCount() {
    return this._moduleCount;
  }

  public make() {
    if (this.typeNumber < 1) {
      let typeNumber = 1;

      for (; typeNumber < 40; typeNumber++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.level);
        const buffer = new BitBuffer();

        for (let i = 0; i < this._dataList.length; i++) {
          const data = this._dataList[i];
          buffer.put(data.getMode(), 4);
          buffer.put(
            data.getLength(),
            getLengthInBits(data.getMode(), typeNumber)
          );
          data.write(buffer);
        }

        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
          totalDataCount += rsBlocks[i].dataCount;
        }

        if (buffer.getLengthInBits() <= totalDataCount * 8) {
          break;
        }
      }
      this.typeNumber = typeNumber as any;
    }

    this._makeImpl(false, this._getBestMaskPattern());
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
        this._dataList
      );
    }
    this._mapData(this._dataCache, maskPattern);
  }

  private _mapData(data: number[], maskPattern: number) {
    let inc = -1;
    let row = this._moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = getMaskFunction(maskPattern);

    for (let col = this._moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;

      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (this._modules[row][col - c] == null) {
            let dark = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }

            const mask = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            this._modules[row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex === -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || this._moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private _makeModules(moduleCount: number) {
    const modules: any[][] = Array.from({ length: moduleCount });
    for (let row = 0; row < moduleCount; row += 1) {
      modules[row] = Array.from({ length: moduleCount });
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
    dataList: QrNumber[]
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

    const dcdata: number[][] = Array.from({ length: rsBlocks.length });
    const ecdata: number[][] = Array.from({ length: rsBlocks.length });

    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = Array.from({ length: dcCount });

      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;

      const rsPoly = getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QrPolynomial(dcdata[r], rsPoly.getLength() - 1);

      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = Array.from({ length: rsPoly.getLength() - 1 });
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    const data: number[] = Array.from({ length: totalCodeCount });
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
