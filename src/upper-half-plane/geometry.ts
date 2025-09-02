import { eucDistance, toComplex } from "../general-math/complex-numbers";
import {
  ComplexNumber,
  PointAtInfinity,
  PositiveNumber,
  UhpBoundaryPoint,
  UhpCircle,
  UhpGeodesic,
  UhpHorocycle,
  UhpInteriorPoint,
  UhpPoint,
} from "../types-validators/types";
import {
  isPointAtInfinity,
  isPositiveNumber,
  isUhpBoundaryPoint,
  isUhpInteriorPoint,
} from "../types-validators/validators";

// Factory functions
//#region
export const toPointAtInfinity = (re: number, im: number): PointAtInfinity => {
  const z = toComplex(re, im);
  if (isPointAtInfinity(z)) return z;
  throw new Error("At least one of the inputs must be Infinity");
};

export const toUhpBoundaryPoint = (
  re: number,
  im: number
): UhpBoundaryPoint => {
  const z = toComplex(re, im);
  if (isUhpBoundaryPoint(z)) return z;
  if (!Number.isFinite(re)) throw new Error("Real part must be finite");
  throw new Error("Imaginary part must be zero");
};

export const toUhpInteriorPoint = (
  re: number,
  im: number
): UhpInteriorPoint => {
  const z = toComplex(re, im);
  if (isUhpInteriorPoint(z)) return z;
  if (!Number.isFinite(re)) throw new Error("Real part must be finite");
  if (!Number.isFinite(im)) throw new Error("Imaginary part must be finite");
  throw new Error("Imaginary part must be positive");
};

export const toUhpPoint = (re: number, im: number): UhpPoint => {
  const z = toComplex(re, im);
  if (isPointAtInfinity(z) || isUhpBoundaryPoint(z) || isUhpInteriorPoint(z))
    return z;
  throw new Error(
    "Invalid Uhp point. Must be one of the following forms (Infinity, Infinity); (Finite, 0); (Finite, Finite and positive)"
  );
};
//#endregion

// Constants
//#region
export const I: UhpInteriorPoint = toUhpInteriorPoint(0, 1);
export const UhpINFINITY: PointAtInfinity = toPointAtInfinity(
  Infinity,
  Infinity
);
export const ZERO: UhpBoundaryPoint = { re: 0, im: 0 };
//#endregion

// Distance formula
//#region
export const uhpDistance = (z: UhpPoint, w: UhpPoint): number =>
  2 * Math.asinh(eucDistance(z, w) / (2 * Math.sqrt(z.im * w.im)));
//#endregion

// Geodesics
//#region
export const geodesicWithPointAtInfinity = (z: UhpPoint): UhpGeodesic => {
  const geodesic: UhpGeodesic = {
    isVertical: true,
    center: UhpINFINITY,
    radius: Infinity,
    points: [],
  };

  if (isUhpBoundaryPoint(z)) {
    geodesic.points = [
      z,
      toUhpPoint(z.re, 1),
      toUhpPoint(z.re, 2),
      UhpINFINITY,
    ];
  } else if (isUhpInteriorPoint(z)) {
    geodesic.points = [
      toUhpPoint(z.re, 0),
      toUhpPoint(z.re, z.im / 2),
      z,
      UhpINFINITY,
    ];
  } else {
    // This should never happen, but I'll include it for safety
    throw new Error("Input is neither an interior nor boundary point");
  }

  return geodesic;
};

export const getGeodesicCenterAndRadius = (
  z: UhpPoint,
  w: UhpPoint,
  tolerance: PositiveNumber
): { center: UhpBoundaryPoint; radius: number } => {
  const getRadius = (centerRe: number) => Math.hypot(z.re - centerRe, z.im);

  /**
   * Case 1: Points have the same imaginary part (up to tolerance)
   * In this case the center has real part that is the midpoint of the given points real parts
   */
  const deltaIm = w.im - z.im;
  const midpointRe = (z.re + w.re) / 2;
  if (Math.abs(deltaIm) < tolerance) {
    return {
      center: { re: midpointRe, im: 0 },
      radius: getRadius(midpointRe),
    };
  }

  /**
   * Case 2: Points have different imaginary parts
   * In this case we find the slope m of the line L connecting the two given points
   * Then we find the equation of the perpendicular bisector of L:
   *    y - midpointIm = (-1 / m)*(x - midpointRe)
   * Setting y = 0 in this equation and solving for x gives the real part of our center
   */
  const midpointIm = (z.im + w.im) / 2;
  const deltaRe = w.re - z.re;
  const slope = deltaIm / deltaRe;
  const centerRe = midpointRe + slope * midpointIm;

  return {
    center: { re: centerRe, im: 0 },
    radius: getRadius(centerRe),
  };
};

export const geodesicConnectingFinitePoints = (
  z: UhpInteriorPoint | UhpBoundaryPoint,
  w: UhpInteriorPoint | UhpBoundaryPoint,
  tolerance: PositiveNumber
): UhpGeodesic => {
  // All cases below will use these values
  const isVertical = Math.abs(w.re - z.re) < tolerance;

  /**
   * Case 1: The points have the same real part (up to tolerance)
   * In this case the geodesic is the vertical line going through them.
   * The center is the point at infinity and the radius is infinite.
   * In all cases, the point at infinity is the last endpoint. If either point is an endpoint, then we can choose a second interior point using the other point. If both are interior points, then the first endpoints is the point below them on the real axis
   */
  if (isVertical) {
    const geodesic: UhpGeodesic = {
      isVertical,
      center: UhpINFINITY,
      radius: Infinity,
      points: [],
    };

    if (isUhpInteriorPoint(z) && isUhpInteriorPoint(w)) {
      geodesic.points.push({ re: z.re, im: 0 }, z, w, UhpINFINITY);
    } else if (isUhpBoundaryPoint(z)) {
      geodesic.points.push(z, toUhpPoint(w.re, w.im / 2), w, UhpINFINITY);
    } else if (isUhpBoundaryPoint(w)) {
      geodesic.points.push(w, toUhpPoint(z.re, z.im / 2), z, UhpINFINITY);
    } else {
      throw new Error(
        "Two distinct boundary points cannot form a vertical geodesic"
      );
    }

    return geodesic;
  }

  // The order of the geodesic points in the rest of the cases depend on the relative position of z and w
  const zLeftOfW = z.re < w.re;

  // This function will be used whenever we need to get an interior point on a geodesic
  const getPointOnGeod = (radius: number, centerRe: number, theta: number) =>
    toUhpPoint(radius * Math.cos(theta) - centerRe, radius * Math.sin(theta));

  /**
   * Case 2: Both points are on the boundary
   * In this case the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
   * The center is the midpoint of the two input points and the radius is half of their separation.
   * We can choose the interior points to be those points on the circle 1/4 and 3/4 of the way from z to w
   */
  if (isUhpBoundaryPoint(z) && isUhpBoundaryPoint(w)) {
    const center: UhpBoundaryPoint = { re: (z.re + w.re) / 2, im: 0 };
    const radius = Math.abs(z.re - w.re) / 2;
    const points: UhpPoint[] = [];
    const geodesic = {
      isVertical,
      center,
      radius,
      points,
    };

    const oneQuarter = getPointOnGeod(radius, center.re, 0.25 * Math.PI);
    const threeQuarter = getPointOnGeod(radius, center.re, 0.75 * Math.PI);

    if (zLeftOfW) {
      geodesic.points.push(z, threeQuarter, oneQuarter, w);
    } else {
      geodesic.points.push(z, oneQuarter, threeQuarter, w);
    }

    return geodesic;
  }

  // Due to the symmetry of the remaining cases, the center and radius will be the same for all of them
  const { center, radius } = getGeodesicCenterAndRadius(z, w, tolerance);
  const geodesic: UhpGeodesic = {
    isVertical,
    center,
    radius,
    points: [],
  };

  /**
   * Case 3: One point is on the boundary and one point is in the interior
   * As in the previous case, the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
   * The center lies on the real axis and is found by (i) finding the perpendicular bisector of the line connecting the two points and then (ii) finding the intersection of the perpendicular bisector with the real axis
   * The first endpoint is one of the given points and the second is the other intersection point of the geodesic with the real axis. The second interior point can be chosen to have half the argument of the first interior point
   */
  if (
    (isUhpInteriorPoint(z) && isUhpBoundaryPoint(w)) ||
    (isUhpBoundaryPoint(z) && isUhpInteriorPoint(w))
  ) {
    // Note: these two cases are super similar, which makes it hard to be DRY
    if (isUhpInteriorPoint(z) && isUhpBoundaryPoint(w)) {
      const zArg = Math.atan2(z.re - center.re, z.im);
      const intPoint = getPointOnGeod(radius, center.re, zArg / 2);

      if (zLeftOfW) {
        geodesic.points.push(toUhpPoint(center.re - radius, 0), z, intPoint, w);
      } else {
        geodesic.points.push(toUhpPoint(center.re + radius, 0), intPoint, z, w);
      }
    } else {
      const wArg = Math.atan2(w.re - center.re, w.im);
      const intPoint = getPointOnGeod(radius, center.re, wArg / 2);

      if (zLeftOfW) {
        geodesic.points.push(z, w, intPoint, toUhpPoint(center.re + radius, 0));
      } else {
        geodesic.points.push(z, intPoint, w, toUhpPoint(center.re - radius, 0));
      }
    }

    return geodesic;
  }

  if (!isUhpInteriorPoint(z) || !isUhpInteriorPoint(w)) {
    // This should never happen, but I'll include it for safety
    throw new Error("Reached final case with two non-interior points");
  }

  /**
   * Case 4: Both points are in the interior
   * This case is very similar to the previous case, except that the endpoints are a bit easier to determine since both given points are in the interior
   */
  const leftEndpoint: UhpBoundaryPoint = { re: center.re - radius, im: 0 };
  const rightEndpoint: UhpBoundaryPoint = { re: center.re + radius, im: 0 };
  if (zLeftOfW) {
    geodesic.points.push(leftEndpoint, z, w, rightEndpoint);
  } else {
    geodesic.points.push(rightEndpoint, z, w, leftEndpoint);
  }

  return geodesic;
};

export const geodesicBetweenPoints = (
  z: UhpPoint,
  w: UhpPoint,
  tolerance: number = 0.01
): UhpGeodesic => {
  if (z.re === w.re && z.im === w.im) {
    throw new Error("Input points must be distinct");
  }

  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (isPointAtInfinity(z) || isPointAtInfinity(w)) {
    const notInf = isPointAtInfinity(z) ? w : z;
    return geodesicWithPointAtInfinity(notInf);
  }

  return geodesicConnectingFinitePoints(z, w, tolerance);
};

export const geodesicFromBaseInDirection = (
  base: UhpInteriorPoint,
  direction: ComplexNumber
): UhpGeodesic => {
  const isVertical = direction.re === 0;
  if (isVertical) {
    return {
      isVertical,
      center: UhpINFINITY,
      radius: Infinity,
      points: [
        { re: base.re, im: 0 },
        base,
        toUhpInteriorPoint(base.re, 2 * base.im),
        UhpINFINITY,
      ],
    };
  }

  const centerRe = base.re + base.im * (direction.im / direction.re);
  const center = toUhpBoundaryPoint(centerRe, 0);
  const radius = Math.hypot(base.re - centerRe, base.im);
  const leftEndpoint = toUhpBoundaryPoint(centerRe - radius, 0);
  const rightEndpoint = toUhpBoundaryPoint(centerRe + radius, 0);

  const baseArg = Math.atan2(base.im, base.re - centerRe);
  const points: UhpPoint[] = [];

  const headingRight = direction.re > 0;
  if (headingRight) {
    const pointAheadOfBase = toUhpInteriorPoint(
      radius * Math.cos(baseArg / 2) + centerRe,
      radius * Math.sin(baseArg / 2)
    );
    points.push(leftEndpoint, base, pointAheadOfBase, rightEndpoint);
  } else {
    const pointAheadOfBase = toUhpInteriorPoint(
      radius * Math.cos((baseArg + Math.PI) / 2) + centerRe,
      radius * Math.sin((baseArg + Math.PI) / 2)
    );
    points.push(rightEndpoint, base, pointAheadOfBase, leftEndpoint);
  }

  return {
    isVertical,
    center,
    radius,
    points,
  };
};
//#endregion

// Circles
//#region
export const circleCenterAndRadius = (
  center: UhpInteriorPoint,
  radius: number
): UhpCircle => ({
  center,
  radius,
  eucCenter: toUhpInteriorPoint(center.re, Math.cosh(radius) * center.im),
  eucRadius: Math.sinh(radius) * center.im,
});

export const circleCenterAndBdryPoint = (
  center: UhpInteriorPoint,
  bdryPoint: UhpInteriorPoint
): UhpCircle => {
  const radius = uhpDistance(center, bdryPoint);
  return circleCenterAndRadius(center, radius);
};
//#endregion

// Horocycles
//#region
export const horocyleGivenCenter = (
  center: UhpInteriorPoint | PointAtInfinity
): UhpHorocycle => {
  if (isPointAtInfinity(center)) {
    return {
      center,
      basePoint: UhpINFINITY,
      bdryPoint: I,
      eucRadius: Infinity,
    };
  }

  return {
    center,
    basePoint: { re: center.re, im: 0 },
    bdryPoint: toUhpInteriorPoint(center.re, 2 * center.im),
    eucRadius: center.im,
  };
};

export const horocycleGivenBaseAndBdry = (
  basePoint: UhpBoundaryPoint | PointAtInfinity,
  bdryPoint: UhpInteriorPoint
): UhpHorocycle => {
  if (isPointAtInfinity(basePoint)) {
    return {
      center: UhpINFINITY,
      basePoint,
      bdryPoint,
      eucRadius: Infinity,
    };
  }

  const eucRadius =
    ((bdryPoint.re - basePoint.re) ** 2 + bdryPoint.im ** 2) /
    (2 * bdryPoint.im);
  const center = toUhpInteriorPoint(basePoint.re, eucRadius);

  return {
    center,
    basePoint,
    bdryPoint,
    eucRadius,
  };
};
//#endregion
