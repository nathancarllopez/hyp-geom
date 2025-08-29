import { Isometry } from "./types-validators/types";
import {
  compose,
  ellipticAboutI,
  inverse,
  moveToI,
  toUhpIsometry,
} from "./upper-half-plane/isometries";
import { toUpperHalfPlanePoint } from "./upper-half-plane/geometry";

// Rotation about re + i*im
export const elliptic = (re: number, im: number, theta: number): Isometry => {
  const centerOfRotation = toUpperHalfPlanePoint(re, im);
  const moveCenterToI = moveToI(centerOfRotation);

  const mobius = compose(
    inverse(moveCenterToI),
    compose(ellipticAboutI(theta), moveCenterToI)
  );

  return toUhpIsometry(mobius);
};
