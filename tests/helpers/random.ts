import { complex } from "../../src/complex-numbers";
import { mobius } from "../../src/mobius-transformations";
import {
  ComplexNumber,
  MobiusTransformation,
  UpperHalfPlanePoint,
} from "../../src/types";
import { upperHalfPlane } from "../../src/upper-half-plane";

export const randomComplex = (upperBound: number = 1e5): ComplexNumber => {
  const re = upperBound * Math.random();
  const im = upperBound * Math.random();

  const flipRe = Math.random() > 0.5;
  const flipIm = Math.random() > 0.5;

  return complex(flipRe ? -re : re, flipIm ? -im : im);
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

  return mobius(a, b, c, d);
};

export const randomUpperHalfPlanePoint = (
  upperBound: number = 1e5,
): UpperHalfPlanePoint => {
  let z: ComplexNumber;

  do {
    z = randomNonZeroComplex(upperBound);
  } while (z.im === 0);

  if (z.im < 0) return upperHalfPlane(z.re, -z.im);
  return upperHalfPlane(z.re, z.im);
};
