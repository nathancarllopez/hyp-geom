import { isPositiveNumber } from "../util";

interface ComplexNumberInterface {
  re: number;
  im: number;
  modulus: number;
  argument: number | null; // Is null when complex number is infinity
}

export function getComplexNumbers(tolerance: number = 1e-4): {
  constants: Record<string, ComplexNumber>;
  factory: (re: number, im: number) => ComplexNumber;
} {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("The tolerance must be a positive number");
  }

  return {
    constants: {
      ZERO: new ComplexNumber(0, 0, tolerance),
      ONE: new ComplexNumber(1, 0, tolerance),
      NEGONE: new ComplexNumber(-1, 0, tolerance),
      I: new ComplexNumber(0, 1, tolerance),
      NEGI: new ComplexNumber(0, -1, tolerance),
      INFINITY: new ComplexNumber(Infinity, Infinity, tolerance),
    },
    factory: (re: number, im: number): ComplexNumber => {
      return new ComplexNumber(re, im, tolerance);
    },
  };
}

export class ComplexNumber implements ComplexNumberInterface {
  readonly re: number;
  readonly im: number;
  readonly modulus: number;
  readonly argument: number | null;
  public _tolerance: number;

  constructor(re: number = 0, im: number = 0, tolerance: number = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("The tolerance must be a positive number");
    }

    const infiniteInputs = re === Infinity || im === Infinity;
    if (infiniteInputs) {
      if (!(re === Infinity && im === Infinity)) {
        throw new Error(
          "If one of the real or imaginary part is infinite, the other must be as well",
        );
      }
    }

    this.re = re;
    this.im = im;
    this.modulus = Math.hypot(re, im);
    this.argument = infiniteInputs ? null : Math.atan2(im, re);
    this._tolerance = tolerance;
  }

  get tolerance() {
    return this._tolerance;
  }

  set tolerance(newTolerance: number) {
    if (!isPositiveNumber(newTolerance)) {
      throw new Error("Tolerance must be positive");
    }
    this._tolerance = newTolerance;
  }

  static ZERO: ComplexNumber = new ComplexNumber();
  static ONE: ComplexNumber = new ComplexNumber(1, 0);
  static NEGONE: ComplexNumber = new ComplexNumber(-1, 0);
  static I: ComplexNumber = new ComplexNumber(0, 1);
  static NEGI: ComplexNumber = new ComplexNumber(0, -1);
  static INFINITY: ComplexNumber = new ComplexNumber(Infinity, Infinity);

  static UNITCIRCLE(theta: number): ComplexNumber {
    return new ComplexNumber(Math.cos(theta), Math.sin(theta));
  }

  isEqualTo(w: ComplexNumber): boolean {
    if (this.re === Infinity || this.im === Infinity) {
      return w.re === Infinity && w.im === Infinity;
    }

    return (
      Math.abs(this.re - w.re) < this._tolerance &&
      Math.abs(this.im - w.im) < this._tolerance
    );
  }

  scale(lambda: number): ComplexNumber {
    return new ComplexNumber(this.re * lambda, this.im * lambda);
  }

  conjugate(): ComplexNumber {
    return new ComplexNumber(this.re, this.im === 0 ? 0 : -this.im);
  }

  add(w: ComplexNumber): ComplexNumber {
    return new ComplexNumber(this.re + w.re, this.im + w.im);
  }

  subtract(w: ComplexNumber): ComplexNumber {
    return this.add(w.scale(-1));
  }

  multiply(w: ComplexNumber): ComplexNumber {
    return new ComplexNumber(
      this.re * w.re - this.im * w.im,
      this.re * w.im + this.im * w.re,
    );
  }

  inverse(): ComplexNumber {
    if (this.isEqualTo(ComplexNumber.ZERO)) {
      throw new Error("Zero has no inverse.");
    }

    return this.conjugate().scale(1 / this.modulus ** 2);
  }

  divide(w: ComplexNumber): ComplexNumber {
    if (w.isEqualTo(ComplexNumber.ZERO)) {
      throw new Error("Cannot divide by zero.");
    }

    return this.multiply(w.inverse());
  }

  eucDistance(w: ComplexNumber): number {
    return this.subtract(w).modulus;
  }

  angleBetween(w: ComplexNumber): number {
    const arg1 = this.argument;
    const arg2 = w.argument;

    if (arg1 === null || arg2 === null) {
      throw new Error("Cannot find angle with infinity");
    }

    return Math.abs(arg1 - arg2);
  }

  nthRoot(n: number = 2): ComplexNumber {
    if (this.argument === null) {
      throw new Error("Cannot take a root of infinity");
    }

    if (n === 0) return ComplexNumber.ONE;

    const rootModulus = Math.pow(this.modulus, 1 / n);
    const rootArg = this.argument / n;

    const onUnitCircle = ComplexNumber.UNITCIRCLE(rootArg);
    return onUnitCircle.scale(rootModulus);
  }
}
