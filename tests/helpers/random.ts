import { toComplex } from "../../src/general-math/complex-numbers";
import { toMobius } from "../../src/general-math/mobius-transformations";
import {
  ComplexNumber,
  MobiusTransformation,
  UhpBoundaryPoint,
  UhpInteriorPoint,
} from "../../src/types-validators/types";
import { toUhpInteriorPoint } from "../../src/upper-half-plane/geometry";

export const randomReal = (upperBound: number = 1e5, isPositive: boolean = false): number => {
  let randomPositive: number;

  do {
    randomPositive = Math.random() * upperBound;
  } while (randomPositive === 0)
  
  if (isPositive) return randomPositive;
  return randomPositive * 2 - upperBound;
}

export const randomComplex = (upperBound: number = 1e5): ComplexNumber => {
  const re = randomReal(upperBound);
  const im = randomReal(upperBound);

  return toComplex(re, im);
};

export const randomNonZeroComplex = (
  upperBound: number = 1e5,
): ComplexNumber => {
  let z: ComplexNumber;

  do {
    z = randomComplex(upperBound);
  } while (z.re === 0 && z.im === 0);

  return z;
};

export const randomMobius = (
  upperBound: number = 1e5,
): MobiusTransformation => {
  const a = randomComplex(upperBound);
  const b = randomComplex(upperBound);
  let c: ComplexNumber;
  let d: ComplexNumber;

  do {
    c = randomComplex(upperBound);
    d = randomComplex(upperBound);
  } while (c.re === 0 && c.im === 0 && d.re === 0 && d.im === 0);

  return toMobius(a, b, c, d);
};

export const randomUhpBoundaryPoint = (
  upperBound: number = 1e5,
): UhpBoundaryPoint => {
  const z = randomComplex(upperBound);
  return { re: z.re, im: 0 };
};

export const randomUhpInteriorPoint = (
  upperBound: number = 1e5,
): UhpInteriorPoint => {
  let z: ComplexNumber;

  do {
    z = randomNonZeroComplex(upperBound);
  } while (z.im === 0);

  if (z.im < 0) return toUhpInteriorPoint(z.re, -z.im);
  return toUhpInteriorPoint(z.re, z.im);
};
