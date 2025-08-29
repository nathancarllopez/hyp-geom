import { complex, ONE, scale, ZERO } from "./complex-numbers";
import {
  CAYLEY,
  compose as mobCompose,
  inverse as mobInverse,
  unitCircleRotation,
  apply as mobApply,
  mobius,
} from "./mobius-transformations";
import {
  isIsometry,
  Isometry,
  MobiusTransformation,
  UpperHalfPlanePoint,
} from "./types";
import { upperHalfPlane } from "./upper-half-plane";

export const uhpIsometry = (m: MobiusTransformation): Isometry => {
  if (!isIsometry(m)) {
    console.log("m:", m);
    throw new Error("Determinant must be nonzero");
  }
  return m;
};

export const INVCAYLEY = uhpIsometry(mobInverse(CAYLEY));

export const apply = (
  m: Isometry,
  z: UpperHalfPlanePoint,
): UpperHalfPlanePoint => {
  const asComplexNumber = mobApply(m, z);
  return upperHalfPlane(asComplexNumber.re, asComplexNumber.im);
};

export const inverse = (m: Isometry): Isometry => uhpIsometry(mobius(m.d, scale(m.b, -1), scale(m.c, -1), m.a))

export const compose = (m: Isometry, n: Isometry) => uhpIsometry((mobCompose(m, n)))

export const ellipticAboutI = (theta: number): Isometry =>
  uhpIsometry(mobCompose(INVCAYLEY, mobCompose(unitCircleRotation(theta), CAYLEY)));

export const moveToI = (z: UpperHalfPlanePoint): Isometry => {
  const moveToImAxis = mobius(ONE, complex(-z.re, 0), ZERO, ONE);
  const pointOnImAxis = mobApply(moveToImAxis, z);

  const scaleDownToI = mobius(complex(1 / pointOnImAxis.im, 0), ZERO, ZERO, ONE);
  const composition = mobCompose(scaleDownToI, moveToImAxis);

  return uhpIsometry(composition);
}