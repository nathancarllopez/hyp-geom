import {
  CAYLEY,
  compose,
  inverse,
  unitCircleRotation,
  apply as mobApply,
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

export const INVCAYLEY = uhpIsometry(inverse(CAYLEY));

export const apply = (
  m: Isometry,
  z: UpperHalfPlanePoint,
): UpperHalfPlanePoint => {
  const asComplexNumber = mobApply(m, z);
  return upperHalfPlane(asComplexNumber.re, asComplexNumber.im);
};

export const rotateAboutI = (theta: number): Isometry =>
  uhpIsometry(compose(INVCAYLEY, compose(unitCircleRotation(theta), CAYLEY)));
