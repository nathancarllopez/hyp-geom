import {
  angleBetween,
  eucDistance,
  scale,
  toComplex,
} from "../general-math/complex-numbers";
import {
  ComplexNumber,
  PointAtInfinity,
  PositiveNumber,
  UhpBoundaryPoint,
  UhpCircle,
  UhpGeodesic,
  UhpGeodesicPoints,
  UhpGeodesicRay,
  UhpGeodesicSegment,
  UhpHorocycle,
  UhpInteriorPoint,
  UhpPoint,
  UhpPolygon,
  UhpRealLine,
} from "../types-validators/types";
import {
  isOnRealLine,
  isPointAtInfinity,
  isPositiveNumber,
  isUhpBoundaryPoint,
  isUhpInteriorPoint,
} from "../types-validators/validators";

// Used to determine when floats are close enough to be considered the same
const TOLERANCE = 1e-4;

// Factory functions
//#region
export const toPointAtInfinity = (re: number, im: number): PointAtInfinity => {
  const z = toComplex(re, im);
  if (isPointAtInfinity(z)) {
    return { re: Infinity, im: Infinity, __brand: "PointAtInfinity" };
  }
  throw new Error("At least one of the inputs must be Infinity");
};

export const toUhpRealLine = (re: number, im: number): UhpRealLine => {
  const z = toComplex(re, im);
  if (isOnRealLine(z)) return z;
  if (!Number.isFinite(re)) throw new Error("Real part must be finite");
  throw new Error("Imaginary part must be zero");
}

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

export const toUhpBoundaryPoint = (re: number, im: number): UhpBoundaryPoint => {
  const z = toComplex(re, im);
  if (isPointAtInfinity(z) || isOnRealLine(z)) return z;
  throw new Error(
    "Invalid Uhp boundary point. Must be of the form (Infinity, Infinity) or (Finite, 0)"
  );
}

// export const toUhpBoundaryPoint = (
//   re: number,
//   im: number
// ): UhpBoundaryPoint => {
//   const z = toComplex(re, im);
//   if (isUhpBoundaryPoint(z)) return z;
//   if (!Number.isFinite(re)) throw new Error("Real part must be finite");
//   throw new Error("Imaginary part must be zero");
// };

export const toUhpPoint = (re: number, im: number): UhpPoint => {
  const z = toComplex(re, im);
  if (isUhpBoundaryPoint(z) || isUhpInteriorPoint(z))
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
export const ONE: UhpBoundaryPoint = { re: 1, im: 0 };
export const NEGONE: UhpBoundaryPoint = { re: -1, im: 0 };
//#endregion

// Distance formula
//#region
export const uhpDistance = (z: UhpPoint, w: UhpPoint): number => {
  if (
    isUhpBoundaryPoint(z) ||
    isUhpBoundaryPoint(w)
  ) {
    return Infinity;
  }

  return 2 * Math.asinh(eucDistance(z, w) / (2 * Math.sqrt(z.im * w.im)));
};
//#endregion

// Angles
//#region
// "position" here refers to the angle of point on the parameterization of a non-vertical geodesic: (radius * cos(t) + center.re, radius * sin(t))
export const positionOnGeodesic = (z: UhpPoint, geod: UhpGeodesic, tolerance: number = TOLERANCE): number => {
  const { isVertical, center, radius } = geod;

  if (isVertical) {
    throw new Error(
      "Points on vertical geodesics are not parameterized by angle"
    );
  }

  if (Math.abs(Math.hypot(z.re - center.re, z.im) - radius) >= tolerance) {
    throw new Error("Point does not lie on this geodesic");
  }

  return Math.atan2(z.im, z.re - center.re);
};

// dirPoint is a point on the geodesic that determines which of the two possible tangent vectors we return, e.g., up vs down for a vertical geodesic
export const tangentAtPointOnGeodesic = (
  basePoint: UhpPoint,
  dirPoint: UhpPoint
): ComplexNumber => {
  const geod = geodesicThroughPoints(basePoint, dirPoint);

  if (geod.isVertical) {
    const vertPart = dirPoint.im > basePoint.im ? 1 : -1;
    return toComplex(0, vertPart);
  }

  const basePosition = positionOnGeodesic(basePoint, geod);
  const dirPosition = positionOnGeodesic(dirPoint, geod);

  const headingRight = basePosition - dirPosition > 0;
  const tangent = toComplex(-Math.sin(basePosition), Math.cos(basePosition));

  if (headingRight) {
    return scale(tangent, -1);
  }

  return tangent;
};

// Finds the angle at q of the intersection of the pq-geodesic and the qr geodesic
export const angleFromThreePoints = (
  p: UhpPoint,
  q: UhpPoint,
  r: UhpPoint
): number => {
  if (isPointAtInfinity(q) || (p.re === r.re && p.im === r.im)) return 0;

  const pqTangent = tangentAtPointOnGeodesic(q, p);
  const qrTangent = tangentAtPointOnGeodesic(q, r);

  return angleBetween(pqTangent, qrTangent);
};
//#endregion

// Geodesics
//#region
export const getPointOnGeodesic = (
  radius: number,
  centerRe: number,
  theta: number,
  tolerance: number = TOLERANCE
): UhpBoundaryPoint | UhpInteriorPoint => {
  if (!isPositiveNumber(radius)) {
    throw new Error("Radius must be positive");
  }

  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (Math.abs(theta % Math.PI) < tolerance) {
    return toUhpBoundaryPoint(radius * Math.cos(theta) + centerRe, 0);
  }

  return toUhpInteriorPoint(
    radius * Math.cos(theta) + centerRe,
    radius * Math.sin(theta)
  );
};

export const geodesicWithPointAtInfinity = (
  z: UhpBoundaryPoint | UhpInteriorPoint,
  infinityFirst: boolean = false
): UhpGeodesic => {
  const isVertical = true;
  const center = UhpINFINITY;
  const radius = Infinity;
  const points: UhpGeodesicPoints = (() => {
    if (isUhpBoundaryPoint(z)) {
      if (infinityFirst) {
        return [
          UhpINFINITY,
          toUhpInteriorPoint(z.re, 2),
          toUhpInteriorPoint(z.re, 1),
          z,
        ];
      }

      return [
        z,
        toUhpInteriorPoint(z.re, 1),
        toUhpInteriorPoint(z.re, 2),
        UhpINFINITY,
      ];
    }

    if (infinityFirst) {
      return [
        UhpINFINITY,
        toUhpInteriorPoint(z.re, 2 * z.im),
        z,
        toUhpBoundaryPoint(z.re, 0),
      ];
    }

    return [
      toUhpBoundaryPoint(z.re, 0),
      z,
      toUhpInteriorPoint(z.re, 2 * z.im),
      UhpINFINITY,
    ];
  })();

  return {
    isVertical,
    center,
    radius,
    points,
  };
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
    const center = UhpINFINITY;
    const radius = Infinity;

    if (isUhpInteriorPoint(z) && isUhpInteriorPoint(w)) {
      return {
        isVertical,
        center,
        radius,
        points: [toUhpBoundaryPoint(z.re, 0), z, w, UhpINFINITY],
      };
    }

    if (isUhpBoundaryPoint(z) && isUhpInteriorPoint(w)) {
      return {
        isVertical,
        center,
        radius,
        points: [z, toUhpInteriorPoint(w.re, w.im / 2), w, UhpINFINITY],
      };
    }

    if (isUhpInteriorPoint(z) && isUhpBoundaryPoint(w)) {
      return {
        isVertical,
        center,
        radius,
        points: [w, toUhpInteriorPoint(z.re, z.im / 2), z, UhpINFINITY],
      };
    }

    throw new Error(
      "Two distinct boundary points cannot form a vertical geodesic"
    );
  }

  // The order of the geodesic points in the rest of the cases depend on the relative position of z and w
  const zLeftOfW = z.re < w.re;

  /**
   * Case 2: Both points are on the boundary
   * In this case the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
   * The center is the midpoint of the two input points and the radius is half of their separation.
   * We can choose the interior points to be those points on the circle 1/4 and 3/4 of the way from z to w
   */
  if (isUhpBoundaryPoint(z) && isUhpBoundaryPoint(w)) {
    const center: UhpBoundaryPoint = { re: (z.re + w.re) / 2, im: 0 };
    const radius = Math.abs(z.re - w.re) / 2;

    const oneQuarter = getPointOnGeodesic(
      radius,
      center.re,
      0.25 * Math.PI
    ) as UhpInteriorPoint;
    const threeQuarter = getPointOnGeodesic(
      radius,
      center.re,
      0.75 * Math.PI
    ) as UhpInteriorPoint;

    const points: UhpGeodesicPoints = zLeftOfW
      ? [z, threeQuarter, oneQuarter, w]
      : [z, oneQuarter, threeQuarter, w];

    return {
      isVertical,
      center,
      radius,
      points,
    };
  }

  // Due to the symmetry of the remaining cases, the center and radius will be the same for all of them
  const { center, radius } = getGeodesicCenterAndRadius(z, w, tolerance);

  /**
   * Case 3: One point is on the boundary and one point is in the interior
   * As in the previous case, the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
   * The center lies on the real axis and is found by (i) finding the perpendicular bisector of the line connecting the two points and then (ii) finding the intersection of the perpendicular bisector with the real axis
   * The first endpoint is one of the given points and the second is the other intersection point of the geodesic with the real axis. The second interior point can be chosen to have half the argument of the first interior point
   */
  if (isUhpInteriorPoint(z) && isUhpBoundaryPoint(w)) {
    const zArg = Math.atan2(z.im, z.re - center.re);
    const intPoint = getPointOnGeodesic(
      radius,
      center.re,
      zArg / 2
    ) as UhpInteriorPoint;

    return {
      isVertical,
      center,
      radius,
      points: zLeftOfW
        ? [toUhpBoundaryPoint(center.re - radius, 0), z, intPoint, w]
        : [toUhpBoundaryPoint(center.re + radius, 0), intPoint, z, w],
    };
  }
  if (isUhpBoundaryPoint(z) && isUhpInteriorPoint(w)) {
    const wArg = Math.atan2(w.re - center.re, w.im);
    const intPoint = getPointOnGeodesic(
      radius,
      center.re,
      wArg / 2
    ) as UhpInteriorPoint;

    return {
      isVertical,
      center,
      radius,
      points: zLeftOfW
        ? [z, w, intPoint, toUhpBoundaryPoint(center.re + radius, 0)]
        : [z, intPoint, w, toUhpBoundaryPoint(center.re - radius, 0)],
    };
  }

  if (!isUhpInteriorPoint(z) || !isUhpInteriorPoint(w)) {
    // This should never happen, but is included
    throw new Error("Reached final case with two non-interior points");
  }

  /**
   * Case 4: Both points are in the interior
   * This case is very similar to the previous case, except that the endpoints are a bit easier to determine since both given points are in the interior
   */
  const leftEndpoint: UhpBoundaryPoint = { re: center.re - radius, im: 0 };
  const rightEndpoint: UhpBoundaryPoint = { re: center.re + radius, im: 0 };

  return {
    isVertical,
    center,
    radius,
    points: zLeftOfW
      ? [leftEndpoint, z, w, rightEndpoint]
      : [rightEndpoint, z, w, leftEndpoint],
  };
};

export const geodesicThroughPoints = (
  z: UhpPoint,
  w: UhpPoint,
  tolerance: number = TOLERANCE
): UhpGeodesic => {
  if (z.re === w.re && z.im === w.im) {
    throw new Error("Input points must be distinct");
  }

  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (isPointAtInfinity(z) || isPointAtInfinity(w)) {
    if (isPointAtInfinity(z) && !isPointAtInfinity(w)) {
      return geodesicWithPointAtInfinity(w);
    }

    if (!isPointAtInfinity(z) && isPointAtInfinity(w)) {
      return geodesicWithPointAtInfinity(z);
    }

    throw new Error("Both points cannot be the point at infinity");
  }

  return geodesicConnectingFinitePoints(z, w, tolerance);
};

export const geodesicFromBaseAndDirection = (
  base: UhpInteriorPoint | UhpBoundaryPoint,
  direction: ComplexNumber,
  tolerance: number = TOLERANCE
): UhpGeodesic => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (isPointAtInfinity(direction)) {
    throw new Error("The point at infinity is not a valid direction vector");
  }

  const isVertical = Math.abs(direction.re) < tolerance;
  if (isVertical) {
    const infinityFirst = direction.im < -tolerance;
    return geodesicWithPointAtInfinity(base, infinityFirst);
  }

  const centerRe = base.re + base.im * (direction.im / direction.re);
  const center = toUhpBoundaryPoint(centerRe, 0);
  const radius = Math.hypot(base.re - centerRe, base.im);

  const leftEndpoint = toUhpBoundaryPoint(centerRe - radius, 0);
  const rightEndpoint = toUhpBoundaryPoint(centerRe + radius, 0);
  const headingRight = direction.re > tolerance;

  if (isUhpBoundaryPoint(base)) {
    const oneQuarterPoint = getPointOnGeodesic(
      radius,
      centerRe,
      0.25 * Math.PI
    ) as UhpInteriorPoint;
    const threeQuarterPoint = getPointOnGeodesic(
      radius,
      centerRe,
      0.75 * Math.PI
    ) as UhpInteriorPoint;

    return {
      isVertical,
      center,
      radius,
      points: headingRight
        ? [base, threeQuarterPoint, oneQuarterPoint, rightEndpoint]
        : [base, oneQuarterPoint, threeQuarterPoint, leftEndpoint],
    };
  }

  const baseArg = Math.atan2(base.im, base.re - centerRe);
  const pointLeftOfBase = getPointOnGeodesic(
    radius,
    centerRe,
    (Math.PI + baseArg) / 2
  ) as UhpInteriorPoint;
  const pointRightOfBase = getPointOnGeodesic(
    radius,
    centerRe,
    baseArg / 2
  ) as UhpInteriorPoint;

  return {
    isVertical,
    center,
    radius,
    points: headingRight
      ? [leftEndpoint, base, pointRightOfBase, rightEndpoint]
      : [rightEndpoint, base, pointLeftOfBase, leftEndpoint],
  };
};
//#endregion

// Segments and rays
//#region
export const segmentBetweenPoints = (
  z: UhpPoint,
  w: UhpPoint,
  tolerance: number = TOLERANCE
): UhpGeodesicSegment => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  const geodesic = geodesicThroughPoints(z, w, tolerance);

  if (isPointAtInfinity(z)) {
    if (isPointAtInfinity(w)) {
      throw new Error("Only one point may be the point at infinity");
    }

    return {
      ...geodesic,
      intAngles: null,
      intHeights: [geodesic.points[1].im, geodesic.points[2].im],
      length: Infinity,
    };
  }

  if (Math.abs(z.re - w.re) < tolerance && Math.abs(z.im - w.im) < tolerance) {
    throw new Error("Points need to be distinct");
  }

  return {
    ...geodesic,
    intAngles: geodesic.isVertical
      ? null
      : [positionOnGeodesic(z, geodesic), positionOnGeodesic(w, geodesic)],
    intHeights: geodesic.isVertical ? [z.im, w.im] : null,
    length: uhpDistance(z, w),
  };
};

export const rayFromPointTowardPoint = (
  base: UhpPoint,
  point: UhpPoint,
  tolerance: number = TOLERANCE
): UhpGeodesicRay => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (isPointAtInfinity(base)) {
    if (isPointAtInfinity(point)) {
      throw new Error("Only one point can be the point at infinity");
    }

    const geodesic = geodesicThroughPoints(base, point, tolerance);

    return {
      ...geodesic,
      baseAngle: null,
      headingRight: null,
      baseHeight: point.im,
      headingUp: false,
    };
  }

  if (
    Math.abs(base.re - point.re) < tolerance &&
    Math.abs(base.im - point.im) < tolerance
  ) {
    throw new Error("Points need to be distinct");
  }

  throw new Error("Not yet finished");
};

export const rayFromPointAndDirection = (
  z: UhpInteriorPoint | UhpBoundaryPoint,
  dir: { x: number; y: number },
  tolerance: number = TOLERANCE
): UhpGeodesicRay => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  if (dir.x === 0 && dir.y === 0) {
    throw new Error("Direction of ray cannot be the zero vector");
  }

  const geodesic = geodesicFromBaseAndDirection(
    z,
    toComplex(dir.x, dir.y),
    tolerance
  );

  return {
    ...geodesic,
    baseAngle: geodesic.isVertical ? null : positionOnGeodesic(z, geodesic),
    headingRight: geodesic.isVertical ? null : dir.x > tolerance,
    baseHeight: geodesic.isVertical ? z.im : null,
    headingUp: geodesic.isVertical ? dir.y > tolerance : null,
  };
};
//#endregion

// Circles
//#region
export const circleCenterAndRadius = (
  center: UhpInteriorPoint,
  radius: number
): UhpCircle => {
  if (!isPositiveNumber(radius)) {
    throw new Error("Radius must be positive");
  }

  return {
    center,
    radius,
    eucCenter: toUhpInteriorPoint(center.re, Math.cosh(radius) * center.im),
    eucRadius: Math.sinh(radius) * center.im,
  };
};

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
      onHorPoint: I,
      eucRadius: Infinity,
    };
  }

  return {
    center,
    basePoint: { re: center.re, im: 0 },
    onHorPoint: toUhpInteriorPoint(center.re, 2 * center.im),
    eucRadius: center.im,
  };
};

export const horocycleGivenBaseAndOnHor = (
  basePoint: UhpBoundaryPoint | PointAtInfinity,
  onHorPoint: UhpInteriorPoint
): UhpHorocycle => {
  if (isPointAtInfinity(basePoint)) {
    return {
      center: UhpINFINITY,
      basePoint,
      onHorPoint,
      eucRadius: Infinity,
    };
  }

  const eucRadius =
    ((onHorPoint.re - basePoint.re) ** 2 + onHorPoint.im ** 2) /
    (2 * onHorPoint.im);
  const center = toUhpInteriorPoint(basePoint.re, eucRadius);

  return {
    center,
    basePoint,
    onHorPoint,
    eucRadius,
  };
};
//#endregion

// Polygons
//#region
export const polygonPerimeter = (sides: UhpGeodesicSegment[]): number =>
  sides.reduce((perimeter, side) => perimeter + side.length, 0);

export const polygonArea = (angles: number[]): number =>
  angles.reduce((area, angle) => area - angle, Math.PI * (angles.length - 2));

export const polygonFromVertices = (
  vertices: UhpPoint[],
  tolerance: number = TOLERANCE
): UhpPolygon => {
  if (!isPositiveNumber(tolerance)) {
    throw new Error("Tolerance needs to be positive");
  }

  const angles: number[] = [];
  const sides: UhpGeodesicSegment[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const prevPoint = i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
    const point = vertices[i];
    const nextPoint = i === vertices.length - 1 ? vertices[0] : vertices[i + 1];

    angles.push(angleFromThreePoints(prevPoint, point, nextPoint));
    sides.push(segmentBetweenPoints(point, nextPoint, tolerance));
  }

  return {
    vertices,
    sides,
    angles,
    area: polygonArea(angles),
    perimeter: polygonPerimeter(sides),
  };
};
//#endregion
