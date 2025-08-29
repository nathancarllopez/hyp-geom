import { determinant } from "../general-math/mobius-transformations";
import { Isometry, MobiusTransformation, PositiveNumber } from "./types";

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isIsometry = (m: MobiusTransformation): m is Isometry => {
  const det = determinant(m);
  const isNonZero = det.re !== 0 || det.im !== 0;

  if (!isNonZero) {
    console.log("transformation:", m);
    console.log("determinant:", det);
  }

  return isNonZero;
};
