import { ComplexNumber } from "../types-validators/types";

export const ZERO: ComplexNumber = { re: 0, im: 0 };
export const ONE: ComplexNumber = { re: 1, im: 0 };
export const I: ComplexNumber = { re: 0, im: 1 };

export const toComplex = (re: number, im: number): ComplexNumber => ({
  re,
  im,
});

export const scale = (z: ComplexNumber, lambda: number): ComplexNumber => ({
  re: lambda * z.re,
  im: lambda * z.im,
});

export const modulus = (z: ComplexNumber): number => Math.hypot(z.re, z.im);

export const conjugate = (z: ComplexNumber): ComplexNumber => ({
  re: z.re,
  im: z.im === 0 ? 0 : -z.im,
});

export const add = (z: ComplexNumber, w: ComplexNumber): ComplexNumber => ({
  re: z.re + w.re,
  im: z.im + w.im,
});

export const multiply = (
  z: ComplexNumber,
  w: ComplexNumber,
): ComplexNumber => ({
  re: z.re * w.re - z.im * w.im,
  im: z.re * w.im + z.im * w.re,
});

export const inverse = (z: ComplexNumber): ComplexNumber => {
  if (z.re === 0 && z.im === 0) {
    throw new Error("Zero has no inverse.");
  }

  const conj = conjugate(z);
  const modSqrd = modulus(z) ** 2;

  return scale(conj, 1 / modSqrd);
};

export const divide = (z: ComplexNumber, w: ComplexNumber): ComplexNumber => {
  if (w.re === 0 && w.im === 0) {
    throw new Error("Cannot divide by zero.");
  }

  return multiply(z, inverse(w));
};

export const subtract = (z: ComplexNumber, w: ComplexNumber): ComplexNumber =>
  add(z, scale(w, -1));

export const eucDistance = (z: ComplexNumber, w: ComplexNumber): number =>
  modulus(subtract(w, z));

export const pointOnUnitCircle = (theta: number): ComplexNumber =>
  toComplex(Math.cos(theta), Math.sin(theta));
