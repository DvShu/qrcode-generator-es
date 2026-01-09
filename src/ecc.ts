// export class Ecc {
//   /*-- Constants --*/

//   public static readonly LOW = new Ecc(0, 1);
//   public static readonly MEDIUM = new Ecc(1, 0);
//   public static readonly QUARTILE = new Ecc(2, 3);
//   public static readonly HIGH = new Ecc(3, 2);

//   /*-- Constructor and fields --*/

//   private constructor(
//     public readonly ordinal: int,
//     public readonly formatBits: int,
//   ) {}
// }

export type EccValue = {
  // In the range 0 to 3 (unsigned 2-bit integer).
  readonly ordinal: number;
  // (Package-private) In the range 0 to 3 (unsigned 2-bit integer).
  readonly formatBits: number;
};

/*
 * The error correction level in a QR Code symbol. Immutable.
 */
export const Ecc = {
  // The QR Code can tolerate about  7% erroneous codewords
  LOW: { ordinal: 0, formatBits: 1 } as EccValue,
  // The QR Code can tolerate about 15% erroneous codewords
  MEDIUM: { ordinal: 1, formatBits: 0 } as EccValue,
  // The QR Code can tolerate about 25% erroneous codewords
  QUARTILE: { ordinal: 2, formatBits: 3 } as EccValue,
  // The QR Code can tolerate about 30% erroneous codewords
  HIGH: { ordinal: 3, formatBits: 2 } as EccValue,
} as const;
