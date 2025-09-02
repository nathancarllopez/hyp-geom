import {
  add,
  divide,
  I,
  multiply,
  ONE,
  pointOnUnitCircle,
  scale,
  ZERO,
} from "../general-math/complex-numbers";
import { ComplexNumber } from "../types-validators/types";

interface MobiusInterface {
  coeffs: ComplexNumber[];
  compose: (n: MobiusTransformation) => MobiusTransformation;
  conjugate: (n: MobiusTransformation) => MobiusTransformation;
  determinant: () => ComplexNumber;
  inverse: () => MobiusTransformation;
  apply: (z: ComplexNumber) => ComplexNumber;
}

export class MobiusTransformation implements MobiusInterface {
  readonly coeffs: ComplexNumber[] = [];

  constructor(a = ONE, b = ZERO, c = ZERO, d = ONE) {
    this.coeffs.push(a, b, c, d);
  }

  compose(n: MobiusTransformation): MobiusTransformation {
    const [a, b, c, d] = this.coeffs;
    const [nA, nB, nC, nD] = n.coeffs;

    const composedA = add(multiply(a, nA), multiply(b, nC));
    const composedB = add(multiply(a, nB), multiply(b, nD));
    const composedC = add(multiply(c, nA), multiply(d, nC));
    const composedD = add(multiply(c, nB), multiply(d, nD));

    return new MobiusTransformation(composedA, composedB, composedC, composedD);
  }

  conjugate(n: MobiusTransformation): MobiusTransformation {
    const det = n.determinant();
    if (det.re === 0 && det.im === 0) {
      console.log("transformation:", n.coeffs);
      console.log("determinant:", det);
      throw new Error("Cannot conjugate by a non-invertible transformation");
    }

    return n.inverse().compose(this.compose(n));
  }

  determinant(): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    return add(multiply(a, d), scale(multiply(b, c), -1));
  }

  inverse(): MobiusTransformation {
    const det = this.determinant();

    if (det.re === 0 && det.im === 0) {
      console.log("transformation:", this.coeffs);
      console.log("determinant:", det);
      throw new Error("Non-invertible transformation");
    }

    const [a, b, c, d] = this.coeffs;
    return new MobiusTransformation(d, scale(b, -1), scale(c, -1), a);
  }

  apply(z: ComplexNumber): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    const numerator = add(multiply(a, z), b);
    const denominator = add(multiply(c, z), d);

    if (denominator.re === 0 && denominator.im === 0) {
      throw new Error(
        "Denominator is zero in Mobius transformation application"
      );
    }

    return divide(numerator, denominator);
  }

  static unitCircleRotation(theta: number): MobiusTransformation {
    return new MobiusTransformation(pointOnUnitCircle(theta), ZERO, ZERO, ONE);
  }

  static cayley(): MobiusTransformation {
    return new MobiusTransformation(ONE, scale(I, -1), ONE, I);
  }

  conjugateByCayley(): MobiusTransformation {
    return this.conjugate(MobiusTransformation.cayley());
  }
}
