import { isPositiveNumber, nearlyEqual } from "../util.js";

interface ComplexNumberInterface {
  re: number;
  im: number;
  modulus: number;
  argument: number | null; // Is null when complex number is infinity
}

export function getComplexNumbers(
  rtol: number = 1e-5,
  atol: number = 1e-8
): {
  constants: Record<string, ComplexNumber>;
  factory: (re: number, im: number) => ComplexNumber;
} {
  if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
    throw new Error("Tolerances must be positive");
  }

  return {
    constants: {
      ZERO: new ComplexNumber(0, 0, rtol, atol),
      ONE: new ComplexNumber(1, 0, rtol, atol),
      NEGONE: new ComplexNumber(-1, 0, rtol, atol),
      I: new ComplexNumber(0, 1, rtol, atol),
      NEGI: new ComplexNumber(0, -1, rtol, atol),
      INFINITY: new ComplexNumber(Infinity, Infinity, rtol, atol),
    },
    factory: (re: number, im: number): ComplexNumber => {
      return new ComplexNumber(re, im, rtol, atol);
    },
  };
}

export class ComplexNumber implements ComplexNumberInterface {
  readonly re: number;
  readonly im: number;
  readonly modulus: number;
  readonly argument: number | null;
  public _rtol: number;
  public _atol: number;

  constructor(
    re: number = 0,
    im: number = 0,
    rtol: number = 1e-5,
    atol: number = 1e-8
  ) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    const infiniteInputs = re === Infinity || im === Infinity;
    if (infiniteInputs) {
      if (!(re === Infinity && im === Infinity)) {
        throw new Error(
          "If one of the real or imaginary part is infinite, the other must be as well"
        );
      }
    }

    this.re = re;
    this.im = im;
    this.modulus = Math.hypot(re, im);
    this.argument = infiniteInputs ? null : Math.atan2(im, re);
    this._rtol = rtol;
    this._atol = atol;
  }

  get rtol() {
    return this._rtol;
  }
  get atol() {
    return this._atol;
  }
  set rtol(newRtol: number) {
    if (!isPositiveNumber(newRtol)) {
      throw new Error("Relative tolerance must be positive");
    }
    this._rtol = newRtol;
  }
  set atol(newAtol: number) {
    if (!isPositiveNumber(newAtol)) {
      throw new Error("Relative tolerance must be positive");
    }
    this._atol = newAtol;
  }

  isEqualTo(w: ComplexNumber): boolean {
    if (this.re === Infinity || this.im === Infinity) {
      return w.re === Infinity && w.im === Infinity;
    }

    return (
      nearlyEqual(this.re, w.re, this._rtol, this._atol) &&
      nearlyEqual(this.im, w.im, this._rtol, this._atol)
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
      this.re * w.im + this.im * w.re
    );
  }

  inverse(): ComplexNumber {
    if (
      nearlyEqual(this.re, 0, this._rtol, this._atol) &&
      nearlyEqual(this.im, 0, this._rtol, this._atol)
    ) {
      throw new Error("Zero has no inverse.");
    }

    return this.conjugate().scale(1 / this.modulus ** 2);
  }

  divide(w: ComplexNumber): ComplexNumber {
    if (
      nearlyEqual(w.re, 0, this._rtol, this._atol) &&
      nearlyEqual(w.im, 0, this._rtol, this._atol)
    ) {
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

    if (n === 0) return new ComplexNumber(1, 0, this._rtol, this._atol);

    const rootModulus = Math.pow(this.modulus, 1 / n);
    const rootArg = this.argument / n;

    return new ComplexNumber(
      rootModulus * Math.cos(rootArg),
      rootModulus * Math.sin(rootArg),
      this._rtol,
      this._atol
    );
  }
}
