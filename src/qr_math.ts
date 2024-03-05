class QRMath {
	public EXP_TABLE: number[];
	public LOG_TABLE: number[];
	public constructor() {
		this.EXP_TABLE = new Array(256);
		this.LOG_TABLE = new Array(256);
		for (let i = 0; i < 8; i += 1) {
			this.EXP_TABLE[i] = 1 << i;
		}
		for (let i = 8; i < 256; i += 1) {
			this.EXP_TABLE[i] =
				this.EXP_TABLE[i - 4] ^
				this.EXP_TABLE[i - 5] ^
				this.EXP_TABLE[i - 6] ^
				this.EXP_TABLE[i - 8];
		}
		for (let i = 0; i < 255; i += 1) {
			this.LOG_TABLE[this.EXP_TABLE[i]] = i;
		}
	}

	glog(n: number) {
		if (n < 1) {
			throw `glog(${n})`;
		}

		return this.LOG_TABLE[n];
	}

	gexp(n: number) {
		while (n < 0) {
			// biome-ignore lint: reason
			n += 255;
		}

		while (n >= 256) {
			// biome-ignore lint: reason
			n -= 255;
		}

		return this.EXP_TABLE[n];
	}
}

export default new QRMath();
