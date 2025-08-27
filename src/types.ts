import { add, multiply, scale } from "./complex-numbers";

export type ComplexNumber = {
  re: number;
  im: number;
};

export type PositiveNumber = number & { __brand: "PositiveNumber" };
export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export interface UpperHalfPlanePoint extends ComplexNumber {
  re: number;
  im: PositiveNumber;
}

export type MobiusTransformation = {
  a: ComplexNumber;
  b: ComplexNumber;
  c: ComplexNumber;
  d: ComplexNumber;
};

export type Isometry = MobiusTransformation & { __brand: "Isometry" };
export const isIsometry = (m: MobiusTransformation): m is Isometry => {
  const determinant = add(multiply(m.a, m.d), scale(multiply(m.b, m.c), -1));
  const isNonZero = determinant.re !== 0 || determinant.im !== 0;

  if (!isNonZero) {
    console.log("det:", determinant);
  }

  return isNonZero;
};
