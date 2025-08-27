import { eucDistance } from "./complex-numbers";
import { isPositiveNumber, UpperHalfPlanePoint } from "./types";

export const upperHalfPlane = (re: number, im: number): UpperHalfPlanePoint => {
  if (!isPositiveNumber(im)) {
    console.log("re, im:", re, im);
    throw new Error("Imaginary part must be positive");
  }
  return { re, im };
};

export const I: UpperHalfPlanePoint = upperHalfPlane(0, 1);

export const hypDistance = (
  z: UpperHalfPlanePoint,
  w: UpperHalfPlanePoint
): number => 2 * Math.asinh(eucDistance(z, w) / (2 * Math.sqrt(z.im * w.im)));

export const geodesicBetweenPoints = (z: UpperHalfPlanePoint, w: UpperHalfPlanePoint) => {}