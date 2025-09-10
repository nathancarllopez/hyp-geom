import {
  ComplexNumber,
  getComplexNumbers,
} from "../../src/general-math/complex-numbers.js";
import { MobiusTransformation } from "../../src/general-math/mobius-transformations.js";
import { getUhpPoints, UhpPoint } from "../../src/upper-half-plane/points.js";

export const randomReal = (
  upperBound: number = 1e5,
  isNonNegative: boolean = false,
): number => {
  const randomTwiceBound = Math.random() * upperBound * 2;

  if (isNonNegative) return randomTwiceBound / 2;
  return randomTwiceBound - upperBound;
};

export const randomComplex = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8,
): ComplexNumber => {
  const re = randomReal(upperBound);
  const im = randomReal(upperBound);

  return getComplexNumbers(rtol, atol).factory(re, im);
};

export const randomNonZeroComplex = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8,
): ComplexNumber => {
  let z: ComplexNumber;

  do {
    z = randomComplex(upperBound, rtol, atol);
  } while (z.re === 0 && z.im === 0);

  return z;
};

export const randomMobius = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8,
  doReduce: boolean = false,
): MobiusTransformation => {
  const { ZERO } = getComplexNumbers(rtol, atol).constants;

  const a = randomComplex(upperBound, rtol, atol);
  const b = randomComplex(upperBound, rtol, atol);
  let c: ComplexNumber;
  let d: ComplexNumber;

  // We don't directly use randomNonZeroComplex here because I want to allow one to be zero but not both
  do {
    c = randomComplex(upperBound, rtol, atol);
    d = randomComplex(upperBound, rtol, atol);
  } while (c.isEqualTo(ZERO) && d.isEqualTo(ZERO));

  const result = new MobiusTransformation([a, b, c, d], rtol, atol);
  if (doReduce) return result.reduce();
  return result;
};

export const randomInvertibleMobius = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8,
  doReduce: boolean = false,
): MobiusTransformation => {
  const { ZERO } = getComplexNumbers(rtol, atol).constants;
  let mobius: MobiusTransformation;

  do {
    mobius = randomMobius(upperBound, rtol, atol, doReduce);
  } while (mobius.determinant().isEqualTo(ZERO));

  return mobius;
};

export const randomUhpPoint = (
  type: "boundary" | "interior" = "interior",
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8,
): UhpPoint => {
  const { factory } = getUhpPoints(rtol, atol);
  const z = randomComplex(upperBound, rtol, atol);

  if (type === "interior") {
    return factory(z.re, Math.abs(z.im));
  }

  const giveInfinity = Math.random() > 0.75
  if (giveInfinity) {
    return factory(Infinity, Infinity);
  }

  return factory(z.re, 0);
}