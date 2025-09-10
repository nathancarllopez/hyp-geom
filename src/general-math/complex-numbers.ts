import { isPositiveNumber, nearlyEqual } from "../util.js";

interface ComplexNumberInterface {
  re: number;
  im: number;
  modulus: number;
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

    if (w.re === Infinity || w.im === Infinity) {
      return this.re === Infinity && this.im === Infinity;
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

  // Via the dot product
  angleBetween(w: ComplexNumber): number {
    const infinity = new ComplexNumber(Infinity, Infinity, this._rtol, this._atol);
    if (this.isEqualTo(infinity) || w.isEqualTo(infinity)) {
      throw new Error("Cannot find an angle with infinity");
    }

    const denominator = this.modulus * w.modulus;
    if (nearlyEqual(denominator, 0, this._rtol, this._atol)) {
      throw new Error("Cannot find an angle with zero");
    }

    const numerator = this.re * w.re + this.im * w.im;
    const cosTheta = Math.max(-1, Math.min(1, numerator / denominator));

    return Math.acos(cosTheta);
  }

  // Right now this is only ever used to take the square root of numbers I expect to be real. If this ever gets used more robustly, I should revisit this.
  principalNthRoot(n: number = 2): ComplexNumber {
    const infinity = new ComplexNumber(Infinity, Infinity, this._rtol, this._atol);
    if (this.isEqualTo(infinity)) {
      throw new Error("Cannot take a root of infinity");
    }

    if (n === 0) {
      return new ComplexNumber(1, 0, this._rtol, this._atol);
    }

    const rootModulus = Math.pow(this.modulus, 1 / n);
    const rootArg = Math.atan2(this.im, this.re) / n; // If this.im is not close to zero, then this might have issues

    return new ComplexNumber(
      rootModulus * Math.cos(rootArg),
      rootModulus * Math.sin(rootArg),
      this._rtol,
      this._atol
    );
  }
}
