import { eucDistance } from "../general-math/complex-numbers";
import { ComplexNumber, UhpGeodesic, UpperHalfPlanePoint } from "../types-validators/types";
import { isPositiveNumber } from "../types-validators/validators";

export const toUpperHalfPlanePoint = (
  re: number,
  im: number,
): UpperHalfPlanePoint => {
  if (!isPositiveNumber(im)) {
    console.log("re, im:", re, im);
    throw new Error("Imaginary part must be positive");
  }
  return { re, im };
};

export const I: UpperHalfPlanePoint = toUpperHalfPlanePoint(0, 1);

export const uhpDistance = (
  z: UpperHalfPlanePoint,
  w: UpperHalfPlanePoint,
): number => 2 * Math.asinh(eucDistance(z, w) / (2 * Math.sqrt(z.im * w.im)));

export const geodesicBetweenPoints = (
  z: UpperHalfPlanePoint,
  w: UpperHalfPlanePoint,
  tolerance: number = 0.01,
): UhpGeodesic => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  const deltaRe = w.re - z.re;
  const isVertical = Math.abs(deltaRe) < tolerance;

  if (isVertical) {
    return {
      isVertical,
      center: { re: Infinity, im: Infinity },
      radius: Infinity,
      points: [{ re: z.re, im: 0 }, z, w, { re: z.re, im: Infinity }],
    };
  }

  const center: ComplexNumber = (() => {
    const deltaIm = w.im - z.im;
    const midpointRe = (z.re + w.re) / 2;

    if (Math.abs(deltaIm) < tolerance) {
      return { re: midpointRe, im: 0 };
    }

    const midpointIm = (z.im + w.im) / 2;
    const slope = deltaIm / deltaRe;
    const centerRe = midpointRe + slope * midpointIm;

    return { re: centerRe, im: 0 };
  })();

  const radius: number = Math.hypot(z.re - center.re, z.im - center.im);

  const points: ComplexNumber[] = [
    { re: center.re - radius, im: 0 },
    z,
    w,
    { re: center.re + radius, im: 0 },
  ];

  return {
    isVertical,
    center,
    radius,
    points,
  };
};
