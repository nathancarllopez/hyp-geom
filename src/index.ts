import { Isometry } from "./types";
import {
  compose,
  ellipticAboutI,
  inverse,
  moveToI,
  uhpIsometry,
} from "./uhp-isometries";
import { upperHalfPlane } from "./upper-half-plane";

// Rotation about re + i*im
export const elliptic = (re: number, im: number, theta: number): Isometry => {
  const centerOfRotation = upperHalfPlane(re, im);
  const moveCenterToI = moveToI(centerOfRotation);

  const mobius = compose(
    inverse(moveCenterToI),
    compose(ellipticAboutI(theta), moveCenterToI)
  );

  return uhpIsometry(mobius);
};
