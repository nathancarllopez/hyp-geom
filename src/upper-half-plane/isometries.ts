import { toComplex, ONE, scale, ZERO } from "../general-math/complex-numbers";
import {
  CAYLEY,
  compose as mobCompose,
  inverse as mobInverse,
  unitCircleRotation,
  apply as mobApply,
  toMobius,
} from "../general-math/mobius-transformations";
import {
  Isometry,
  MobiusTransformation,
  UhpPoint,
} from "../types-validators/types";
import { isIsometry } from "../types-validators/validators";
import { toUhpPoint } from "./geometry";

export const toUhpIsometry = (m: MobiusTransformation): Isometry => {
  if (isIsometry(m)) return m;
  throw new Error("Determinant must be nonzero");
};

export const INVCAYLEY = toUhpIsometry(mobInverse(CAYLEY));

export const apply = (m: Isometry, z: UhpPoint): UhpPoint => {
  const asComplexNumber = mobApply(m, z);
  return toUhpPoint(asComplexNumber.re, asComplexNumber.im);
};

export const inverse = (m: Isometry): Isometry =>
  toUhpIsometry(toMobius(m.d, scale(m.b, -1), scale(m.c, -1), m.a));

export const compose = (m: Isometry, n: Isometry) =>
  toUhpIsometry(mobCompose(m, n));

export const ellipticAboutI = (theta: number): Isometry =>
  toUhpIsometry(
    mobCompose(INVCAYLEY, mobCompose(unitCircleRotation(theta), CAYLEY)),
  );

export const moveToI = (z: UhpPoint): Isometry => {
  const moveToImAxis = toMobius(ONE, toComplex(-z.re, 0), ZERO, ONE);
  const pointOnImAxis = mobApply(moveToImAxis, z);

  const scaleDownToI = toMobius(
    toComplex(1 / pointOnImAxis.im, 0),
    ZERO,
    ZERO,
    ONE,
  );
  const composition = mobCompose(scaleDownToI, moveToImAxis);

  return toUhpIsometry(composition);
};

export const elliptic = (re: number, im: number, theta: number): Isometry => {
  const centerOfRotation = toUhpPoint(re, im);
  const moveCenterToI = moveToI(centerOfRotation);

  const mobius = compose(
    inverse(moveCenterToI),
    compose(ellipticAboutI(theta), moveCenterToI),
  );

  return toUhpIsometry(mobius);
};
