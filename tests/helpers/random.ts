import {
  ComplexNumber,
  getComplexNumbers,
} from "../../src/general-math/complex-numbers.js";
import { MobiusTransformation } from "../../src/general-math/mobius-transformations.js";
import { getUhpPoints, UhpPoint } from "../../src/upper-half-plane/points.js";

export const randomReal = (
  upperBound: number = 1e5,
  isPositive: boolean = false
): number => {
  let randomPositive: number;

  do {
    randomPositive = Math.random() * 2 * upperBound;
  } while (randomPositive === 0);

  if (isPositive) return randomPositive / 2;
  return randomPositive - upperBound;
};

export const randomComplex = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8
): ComplexNumber => {
  const re = randomReal(upperBound);
  const im = randomReal(upperBound);

  return getComplexNumbers(rtol, atol).factory(re, im);
};

export const randomNonZeroComplex = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8
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
  doReduce: boolean = false
): MobiusTransformation => {
  const { ZERO } = getComplexNumbers(rtol, atol).constants;

  const a = randomComplex(upperBound, rtol, atol);
  const b = randomComplex(upperBound, rtol, atol);
  let c: ComplexNumber;
  let d: ComplexNumber;

  do {
    c = randomComplex(upperBound, rtol, atol);
    d = randomComplex(upperBound, rtol, atol);
  } while (c.isEqualTo(ZERO) && d.isEqualTo(ZERO));

  const result = new MobiusTransformation([a, b, c, d], rtol, atol);
  if (doReduce) return result.reduce();
  return result;
};

export const randomUhpBoundaryPoint = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8
): UhpPoint => {
  const z = randomComplex(upperBound, rtol, atol);
  return getUhpPoints(rtol, atol).factory(z.re, 0);
};

export const randomUhpInteriorPoint = (
  upperBound: number = 1e5,
  rtol: number = 1e-5,
  atol: number = 1e-8
): UhpPoint => {
  let z: ComplexNumber;

  do {
    z = randomNonZeroComplex(upperBound, rtol, atol);
  } while (z.im === 0);

  const { factory } = getUhpPoints(rtol, atol);

  if (z.im < 0) return factory(z.re, -z.im);
  return factory(z.re, z.im);
};
