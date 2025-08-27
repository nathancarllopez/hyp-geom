import {
  add,
  divide,
  I,
  multiply,
  ONE,
  pointOnUnitCircle,
  scale,
  ZERO,
} from "./complex-numbers";
import { ComplexNumber, MobiusTransformation } from "./types";

export const IDENTITY: MobiusTransformation = {
  a: ONE,
  b: ZERO,
  c: ZERO,
  d: ONE,
};
export const CAYLEY: MobiusTransformation = {
  a: ONE,
  b: scale(I, -1),
  c: ONE,
  d: I,
};

export const mobius = (
  a: ComplexNumber,
  b: ComplexNumber,
  c: ComplexNumber,
  d: ComplexNumber
): MobiusTransformation => ({ a, b, c, d });

export const apply = (
  m: MobiusTransformation,
  z: ComplexNumber
): ComplexNumber => {
  const numerator = add(multiply(m.a, z), m.b);
  const denominator = add(multiply(m.c, z), m.d);

  if (denominator.re === 0 && denominator.im === 0) {
    throw new Error("Denominator is zero in Mobius transformation application");
  }

  return divide(numerator, denominator);
};

export const determinant = (m: MobiusTransformation): ComplexNumber =>
  add(multiply(m.a, m.d), scale(multiply(m.b, m.c), -1));

export const inverse = (m: MobiusTransformation): MobiusTransformation => {
  const det = determinant(m);

  if (det.re === 0 && det.im === 0) {
    console.log("transformation:", m);
    console.log("determinant:", det);
    throw new Error("Non-invertible transformation");
  }

  return mobius(m.d, scale(m.b, -1), scale(m.c, -1), m.a);
};

export const compose = (
  m: MobiusTransformation,
  n: MobiusTransformation
): MobiusTransformation => {
  const a = add(multiply(m.a, n.a), multiply(m.b, n.c));
  const b = add(multiply(m.a, n.b), multiply(m.b, n.d));
  const c = add(multiply(m.c, n.a), multiply(m.d, n.c));
  const d = add(multiply(m.c, n.b), multiply(m.d, n.d));

  return mobius(a, b, c, d);
};

export const unitCircleRotation = (theta: number) =>
  mobius(pointOnUnitCircle(theta), ZERO, ZERO, ONE);
