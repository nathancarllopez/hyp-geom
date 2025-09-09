import {
  ComplexNumber,
  getComplexNumbers,
} from "../../src/general-math/complex-numbers";
import { MobiusTransformation } from "../../src/general-math/mobius-transformations";
import { getUhpPoints, UhpPoint } from "../../src/upper-half-plane/points";

export const randomReal = (
  upperBound: number = 1e5,
  isPositive: boolean = false,
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
  tolerance: number = 1e-4,
): ComplexNumber => {
  const re = randomReal(upperBound);
  const im = randomReal(upperBound);

  return getComplexNumbers(tolerance).factory(re, im);
};

export const randomNonZeroComplex = (
  upperBound: number = 1e5,
  tolerance: number = 1e-4,
): ComplexNumber => {
  let z: ComplexNumber;

  do {
    z = randomComplex(upperBound, tolerance);
  } while (z.re === 0 && z.im === 0);

  return z;
};

export const randomMobius = (
  upperBound: number = 1e5,
  tolerance: number = 1e-4,
  doReduce: boolean = false,
): MobiusTransformation => {
  const { ZERO } = getComplexNumbers(tolerance).constants;

  const a = randomComplex(upperBound, tolerance);
  const b = randomComplex(upperBound, tolerance);
  let c: ComplexNumber;
  let d: ComplexNumber;

  do {
    c = randomComplex(upperBound, tolerance);
    d = randomComplex(upperBound, tolerance);
  } while (c.isEqualTo(ZERO) && d.isEqualTo(ZERO));

  const result = new MobiusTransformation([a, b, c, d], tolerance);
  if (doReduce) return result.reduce();
  return result;
};

export const randomUhpBoundaryPoint = (
  upperBound: number = 1e5,
  tolerance: number = 1e-4,
): UhpPoint => {
  const z = randomComplex(upperBound, tolerance);
  return getUhpPoints(tolerance).factory(z.re, 0);
};

export const randomUhpInteriorPoint = (
  upperBound: number = 1e5,
  tolerance: number = 1e-4,
): UhpPoint => {
  let z: ComplexNumber;

  do {
    z = randomNonZeroComplex(upperBound, tolerance);
  } while (z.im === 0);

  const { factory } = getUhpPoints(tolerance);

  if (z.im < 0) return factory(z.re, -z.im);
  return factory(z.re, z.im);
};
