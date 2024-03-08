import QRMath from "./qr_math";

export default class QrPolynomial {
  private _num: number[];
  public constructor(num: number[], shift: number) {
    if (typeof num.length === "undefined") {
      throw `${num.length}${shift}`;
    }
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }
    this._num = Array.from({ length: num.length - offset + shift });
    for (let i = 0; i < num.length - offset; i += 1) {
      this._num[i] = num[i + offset];
    }
  }

  getAt(index: number) {
    return this._num[index];
  }

  getLength() {
    return this._num.length;
  }

  multiply(e: QrPolynomial) {
    const num = Array.from<number>({
      length: this.getLength() + e.getLength() - 1,
    });

    for (let i = 0; i < this.getLength(); i += 1) {
      for (let j = 0; j < e.getLength(); j += 1) {
        num[i + j] ^= QRMath.gexp(
          QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j))
        );
      }
    }

    return new QrPolynomial(num, 0);
  }

  mod(e: QrPolynomial): QrPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }

    const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));

    const num = Array.from<number>({ length: this.getLength() });
    for (let i = 0; i < this.getLength(); i += 1) {
      num[i] = this.getAt(i);
    }

    for (let i = 0; i < e.getLength(); i += 1) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }

    // recursive call
    return new QrPolynomial(num, 0).mod(e);
  }
}
