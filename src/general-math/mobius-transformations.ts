import { isPositiveNumber } from "../util.js";
import { ComplexNumber, getComplexNumbers } from "./complex-numbers.js";

export function getMobiusTranformations(
  rtol: number = 1e-5,
  atol: number = 1e-8,
): {
  constants: Record<string, MobiusTransformation>;
  factory: (coeffs: ComplexNumber[]) => MobiusTransformation;
} {
  if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
    throw new Error("Tolerances must be positive");
  }

  const {
    constants: { ZERO, ONE, I, NEGI },
  } = getComplexNumbers(rtol, atol);

  return {
    constants: {
      IDENTITY: new MobiusTransformation([ONE, ZERO, ZERO, ONE], rtol, atol),
      CAYLEY: new MobiusTransformation(
        [ONE, NEGI, ONE, I],
        rtol,
        atol,
      ).reduce(),
    },
    factory: (coeffs: ComplexNumber[]): MobiusTransformation => {
      return new MobiusTransformation(coeffs, rtol, atol);
    },
  };
}

export class MobiusTransformation {
  private constants: Record<string, ComplexNumber>;
  readonly coeffs: ComplexNumber[];
  public _rtol: number;
  public _atol: number;

  constructor(
    coeffs: ComplexNumber[],
    rtol: number = 1e-5,
    atol: number = 1e-8,
  ) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    if (coeffs.length !== 4) {
      throw new Error(
        "Must provide exactly four complex numbers as coefficients",
      );
    }

    const { constants } = getComplexNumbers(rtol, atol);
    const [, , c, d] = coeffs;

    if (c.isEqualTo(constants.ZERO) && d.isEqualTo(constants.ZERO)) {
      throw new Error("Denominator of mobius transformation cannot be zero");
    }

    this.constants = constants;
    this.coeffs = coeffs;
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

  // A Mobius transformation is determined by where it sends three points
  isEqualTo(n: MobiusTransformation): boolean {
    const testPoints = [
      this.constants.ONE,
      this.constants.ZERO,
      this.constants.I,
    ];

    for (const point of testPoints) {
      const z = this.apply(point);
      const w = n.apply(point);

      if (!z.isEqualTo(w)) {
        return false;
      }
    }

    return true;
  }

  reduce(): MobiusTransformation {
    const det = this.determinant();
    if (det.isEqualTo(this.constants.ZERO)) {
      return this;
    }

    const sqrtDet = det.principalNthRoot();
    const reducedCoeffs = this.coeffs.map((coeff) => coeff.divide(sqrtDet));

    return new MobiusTransformation(reducedCoeffs, this._rtol, this._atol);
  }

  compose(
    n: MobiusTransformation,
    doReduce: boolean = false,
  ): MobiusTransformation {
    const [a, b, c, d] = this.coeffs;
    const [nA, nB, nC, nD] = n.coeffs;

    const composedA = a.multiply(nA).add(b.multiply(nC));
    const composedB = a.multiply(nB).add(b.multiply(nD));
    const composedC = c.multiply(nA).add(d.multiply(nC));
    const composedD = c.multiply(nB).add(d.multiply(nD));

    const composition = new MobiusTransformation(
      [composedA, composedB, composedC, composedD],
      this._rtol,
      this._atol,
    );

    if (doReduce) return composition.reduce();
    return composition;
  }

  conjugate(
    n: MobiusTransformation,
    doReduce: boolean = false,
  ): MobiusTransformation {
    const det = n.determinant();
    if (det.isEqualTo(this.constants.ZERO)) {
      console.log("transformation:", n.coeffs);
      console.log("determinant:", det);
      throw new Error("Cannot conjugate by a non-invertible transformation");
    }

    const conj = n.inverse(doReduce).compose(this.compose(n), doReduce);
    return conj;
  }

  determinant(): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    const ad = a.multiply(d);
    const bc = b.multiply(c);

    return ad.subtract(bc);
  }

  inverse(doReduce: boolean = false): MobiusTransformation {
    const det = this.determinant();

    if (det.isEqualTo(this.constants.ZERO)) {
      console.log("transformation:", this.coeffs);
      console.log("determinant:", det);
      throw new Error("Non-invertible transformation");
    }

    const [a, b, c, d] = this.coeffs;
    const inv = new MobiusTransformation(
      [d, b.scale(-1), c.scale(-1), a],
      this._rtol,
      this._atol,
    );

    if (doReduce) return inv.reduce();
    return inv;
  }

  apply(z: ComplexNumber): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    const numerator = a.multiply(z).add(b);
    const denominator = c.multiply(z).add(d);

    if (denominator.isEqualTo(this.constants.ZERO)) {
      return this.constants.INFINITY;
    }

    return numerator.divide(denominator);
  }
}
