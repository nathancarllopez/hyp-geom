import { ComplexNumber } from "../general-math/complex-numbers.js";
import { isPositiveNumber } from "../util.js";

export function getUhpPoints(tolerance: number = 1e-4): {
  constants: Record<string, UhpPoint>;
  factory: (re: number, im: number) => UhpPoint;
} {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("The tolerance must be a positive number");
  }

  return {
    constants: {
      ZERO: new UhpPoint(0, 0, tolerance),
      ONE: new UhpPoint(1, 0, tolerance),
      NEGONE: new UhpPoint(-1, 0, tolerance),
      I: new UhpPoint(0, 1, tolerance),
      NEGI: new UhpPoint(0, -1, tolerance),
      INFINITY: new UhpPoint(Infinity, Infinity, tolerance),
    },
    factory: (re: number, im: number) => {
      return new UhpPoint(re, im, tolerance);
    },
  };
}

export class UhpPoint extends ComplexNumber {
  readonly type: "interior" | "boundary";
  readonly subType?: "on-real-line" | "infinity";

  constructor(re: number = 0, im: number = 0, tolerance: number = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("The tolerance must be a positive number");
    }

    if (im < 0) {
      throw new Error("Imaginary part cannot be negative");
    }

    super(re, im, tolerance);

    if (Number.isFinite(this.im) && this.im > 0) {
      this.type = "interior";
    } else {
      this.type = "boundary";
      this.subType =
        re === Infinity && im === Infinity ? "infinity" : "on-real-line";
    }
  }
}
