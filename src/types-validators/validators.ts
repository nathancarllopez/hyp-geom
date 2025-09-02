import { determinant } from "../general-math/mobius-transformations";
import {
  ComplexNumber,
  Isometry,
  MobiusTransformation,
  PointAtInfinity,
  PositiveNumber,
  UhpBoundaryPoint,
  UhpInteriorPoint,
} from "./types";

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isPointAtInfinity = (z: ComplexNumber): z is PointAtInfinity =>
  z.re === Infinity || z.im === Infinity;

export const isUhpBoundaryPoint = (z: ComplexNumber): z is UhpBoundaryPoint =>
  Number.isFinite(z.re) && z.im === 0;

export const isUhpInteriorPoint = (z: ComplexNumber): z is UhpInteriorPoint =>
  Number.isFinite(z.re) && Number.isFinite(z.im) && z.im > 0;

export const isIsometry = (m: MobiusTransformation): m is Isometry => {
  const det = determinant(m);
  const isNonZero = det.re !== 0 || det.im !== 0;

  if (!isNonZero) {
    console.log("transformation:", m);
    console.log("determinant:", det);
  }

  return isNonZero;
};
