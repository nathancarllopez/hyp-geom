import { ComplexNumber } from "../general-math/complex-numbers.js";
import { isPositiveNumber } from "../util.js";

export function getUhpPoints(
  rtol: number = 1e-5,
  atol: number = 1e-8,
): {
  constants: Record<string, UhpPoint>;
  factory: (re: number, im: number) => UhpPoint;
} {
  if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
    throw new Error("Tolerances must be positive");
  }

  return {
    constants: {
      ZERO: new UhpPoint(0, 0, rtol, atol),
      ONE: new UhpPoint(1, 0, rtol, atol),
      NEGONE: new UhpPoint(-1, 0, rtol, atol),
      I: new UhpPoint(0, 1, rtol, atol),
      NEGI: new UhpPoint(0, -1, rtol, atol),
      INFINITY: new UhpPoint(Infinity, Infinity, rtol, atol),
    },
    factory: (re: number, im: number) => {
      return new UhpPoint(re, im, rtol, atol);
    },
  };
}

export class UhpPoint extends ComplexNumber {
  readonly type: "interior" | "boundary";
  readonly subType?: "on-real-line" | "infinity";

  constructor(
    re: number = 0,
    im: number = 0,
    rtol: number = 1e-5,
    atol: number = 1e-8,
  ) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    if (im < 0) {
      throw new Error("Imaginary part cannot be negative");
    }

    super(re, im, rtol, atol);

    if (Number.isFinite(this.im) && this.im > 0) {
      this.type = "interior";
    } else {
      this.type = "boundary";
      this.subType =
        re === Infinity && im === Infinity ? "infinity" : "on-real-line";
    }
  }
}
