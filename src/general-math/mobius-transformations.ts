import { isPositiveNumber } from "../util.js";
import { ComplexNumber, getComplexNumbers } from "./complex-numbers.js";

export function getMobiusTranformations(tolerance: number = 1e-4): {
  constants: Record<string, MobiusTransformation>;
  factory: (coeffs: ComplexNumber[]) => MobiusTransformation;
} {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("The tolerance must be a positive number");
  }

  const {
    constants: { ZERO, ONE, I, NEGI },
  } = getComplexNumbers(tolerance);

  return {
    constants: {
      IDENTITY: new MobiusTransformation([ONE, ZERO, ZERO, ONE], tolerance),
      CAYLEY: new MobiusTransformation([ONE, NEGI, ONE, I], tolerance).reduce(),
    },
    factory: (coeffs: ComplexNumber[]): MobiusTransformation => {
      return new MobiusTransformation(coeffs, tolerance);
    },
  };
}

export class MobiusTransformation {
  public _tolerance: number;
  readonly coeffs: ComplexNumber[];
  private constants: Record<string, ComplexNumber>;

  constructor(coeffs: ComplexNumber[], tolerance: number = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("The tolerance must be a positive number");
    }

    if (coeffs.length !== 4) {
      throw new Error(
        "Must provide exactly four complex numbers as coefficients",
      );
    }

    const { constants } = getComplexNumbers(tolerance);
    const [, , c, d] = coeffs;

    if (c.isEqualTo(constants.ZERO) && d.isEqualTo(constants.ZERO)) {
      throw new Error("Denominator of mobius transformation cannot be zero");
    }

    this._tolerance = tolerance;
    this.coeffs = coeffs;
    this.constants = constants;
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

    const sqrtDet = det.nthRoot();
    const reducedCoeffs = this.coeffs.map((coeff) => coeff.divide(sqrtDet));

    return new MobiusTransformation(reducedCoeffs, this._tolerance);
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
      this._tolerance,
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
      this._tolerance,
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
