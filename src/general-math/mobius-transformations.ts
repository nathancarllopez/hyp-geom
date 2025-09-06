import {
  add,
  divide,
  I,
  multiply,
  nthRoot,
  ONE,
  pointOnUnitCircle,
  scale,
  ZERO,
} from "../general-math/complex-numbers";
import { ComplexNumber } from "../types-validators/types";

interface MobiusInterface {
  coeffs: ComplexNumber[];
  reduce: () => MobiusTransformation;
  compose: (n: MobiusTransformation) => MobiusTransformation;
  conjugate: (n: MobiusTransformation) => MobiusTransformation;
  conjugateByCayley: () => MobiusTransformation;
  determinant: () => ComplexNumber;
  inverse: () => MobiusTransformation;
  apply: (z: ComplexNumber) => ComplexNumber;
}

export class MobiusTransformation implements MobiusInterface {
  readonly coeffs: ComplexNumber[] = [];

  constructor(
    a: ComplexNumber = ONE,
    b: ComplexNumber = ZERO,
    c: ComplexNumber = ZERO,
    d: ComplexNumber = ONE
  ) {
    if (c.re === 0 && c.im === 0 && d.re === 0 && d.im === 0) {
      throw new Error("Denominator of mobius transformation cannot be zero")
    }

    this.coeffs.push(a, b, c, d);
  }

  reduce(): MobiusTransformation {
    const det = this.determinant();
    if (det.re === 0 && det.im === 0) {
      return this;
    }

    const sqrtDet = nthRoot(det);
    const reducedCoeffs = this.coeffs.map((coeff) => divide(coeff, sqrtDet));
    
    return new MobiusTransformation(...reducedCoeffs);
  }

  compose(n: MobiusTransformation, doReduce: boolean = false): MobiusTransformation {
    const [a, b, c, d] = this.coeffs;
    const [nA, nB, nC, nD] = n.coeffs;

    const composedA = add(multiply(a, nA), multiply(b, nC));
    const composedB = add(multiply(a, nB), multiply(b, nD));
    const composedC = add(multiply(c, nA), multiply(d, nC));
    const composedD = add(multiply(c, nB), multiply(d, nD));

    const composition = new MobiusTransformation(composedA, composedB, composedC, composedD);

    if (doReduce) return composition.reduce();
    return composition;
  }

  conjugate(n: MobiusTransformation, doReduce: boolean = false): MobiusTransformation {
    const det = n.determinant();
    if (det.re === 0 && det.im === 0) {
      console.log("transformation:", n.coeffs);
      console.log("determinant:", det);
      throw new Error("Cannot conjugate by a non-invertible transformation");
    }

    const conj = n.inverse(doReduce).compose(this.compose(n), doReduce);
    return conj;
  }

  conjugateByCayley(doReduce: boolean = false): MobiusTransformation {
    return this.conjugate(MobiusTransformation.cayley(), doReduce);
  }

  determinant(): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    const ad = multiply(a, d);
    const bc = multiply(b, c);

    const det = add(ad, scale(bc, -1));

    return det;
  }

  inverse(doReduce: boolean = false): MobiusTransformation {
    const det = this.determinant();

    if (det.re === 0 && det.im === 0) {
      console.log("transformation:", this.coeffs);
      console.log("determinant:", det);
      throw new Error("Non-invertible transformation");
    }

    const [a, b, c, d] = this.coeffs;
    const inv = new MobiusTransformation(d, scale(b, -1), scale(c, -1), a);

    if (doReduce) return inv.reduce();
    return inv;
  }

  apply(z: ComplexNumber): ComplexNumber {
    const [a, b, c, d] = this.coeffs;
    const numerator = add(multiply(a, z), b);
    const denominator = add(multiply(c, z), d);

    if (denominator.re === 0 && denominator.im === 0) {
      return { re: Infinity, im: Infinity };
    }

    return divide(numerator, denominator);
  }

  static unitCircleRotation(theta: number): MobiusTransformation {
    return new MobiusTransformation(pointOnUnitCircle(theta), ZERO, ZERO, ONE);
  }

  static cayley(): MobiusTransformation {
    return new MobiusTransformation(ONE, scale(I, -1), ONE, I);
  }
}