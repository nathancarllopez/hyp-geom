import { ComplexNumber } from "../general-math/complex-numbers.js";
import { isPositiveNumber } from "../util.js";
import { getUhpPoints, UhpPoint } from "./points.js";
import {
  UhpCircle,
  UhpGeodesic,
  UhpGeodesicSegment,
  UhpHorocycle,
  UhpPolygon,
} from "./types.js";

export class UhpGeometry {
  // Fields and Constructor
  //#region
  public _tolerance: number;
  private constants: Record<string, UhpPoint>;
  private pointFactory: (re: number, im: number) => UhpPoint;

  constructor(tolerance: number = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("The tolerance must be a positive number");
    }

    const { constants, factory } = getUhpPoints(tolerance);

    this._tolerance = tolerance;
    this.constants = constants;
    this.pointFactory = factory;
  }

  get tolerance() {
    return this._tolerance;
  }

  set tolerance(newTolerance: number) {
    if (!isPositiveNumber(newTolerance)) {
      throw new Error("Tolerance must be positive");
    }
    this._tolerance = newTolerance;
  }
  //#endregion

  // Distance function
  //#region
  distance(z: UhpPoint, w: UhpPoint): number {
    if (z.type === "boundary" || w.type === "boundary") {
      return Infinity;
    }

    return 2 * Math.asinh(z.eucDistance(w) / (2 * Math.sqrt(z.im * w.im)));
  }
  //#endregion

  // Angles
  //#region
  // "position" here refers to the angle of point on the parameterization of a non-vertical geodesic: (radius * cos(t) + center.re, radius * sin(t))
  positionOnGeodesic(z: UhpPoint, geod: UhpGeodesic): number {
    const { isVertical, center, radius } = geod;

    if (isVertical) {
      throw new Error(
        "Points on vertical geodesics are not parameterized by angle",
      );
    }

    if (
      Math.abs(Math.hypot(z.re - center.re, z.im) - radius) >= this._tolerance
    ) {
      throw new Error("Point does not lie on this geodesic");
    }

    return Math.atan2(z.im, z.re - center.re);
  }

  // dirPoint is a point on the geodesic that determines which of the two possible tangent vectors we return, e.g., up vs down for a vertical geodesic
  tangentAtPointOnGeodesic(
    basePoint: UhpPoint,
    dirPoint: UhpPoint,
  ): ComplexNumber {
    const geod = this.geodesicThroughPoints(basePoint, dirPoint);

    if (geod.isVertical) {
      const vertPart = dirPoint.im > basePoint.im ? 1 : -1;
      return new ComplexNumber(0, vertPart);
    }

    const basePosition = this.positionOnGeodesic(basePoint, geod);
    const dirPosition = this.positionOnGeodesic(dirPoint, geod);

    const headingRight = basePosition - dirPosition > 0;
    const tangent = new ComplexNumber(
      -Math.sin(basePosition),
      Math.cos(basePosition),
    );

    if (headingRight) tangent.scale(-1);
    return tangent;
  }

  // Finds the angle at q of the intersection of the pq-geodesic and the qr geodesic
  angleFromThreePoints(p: UhpPoint, q: UhpPoint, r: UhpPoint): number {
    if (q.subType === "infinity" || p.isEqualTo(r)) return 0;

    const pqTangent = this.tangentAtPointOnGeodesic(q, p);
    const qrTangent = this.tangentAtPointOnGeodesic(q, r);

    return pqTangent.angleBetween(qrTangent);
  }
  //#endregion

  // Geodesics
  //#region
  getPointOnGeodesic(
    radius: number,
    centerRe: number,
    theta: number,
  ): UhpPoint {
    if (!isPositiveNumber(radius)) {
      throw new Error("Radius must be positive");
    }

    if (Math.abs(theta % Math.PI) < this._tolerance) {
      return this.pointFactory(radius * Math.cos(theta) + centerRe, 0);
    }

    return this.pointFactory(
      radius * Math.cos(theta) + centerRe,
      radius * Math.sin(theta),
    );
  }

  geodesicWithPointAtInfinity(
    z: UhpPoint,
    infinityFirst: boolean = false,
  ): UhpGeodesic {
    const geodesic: UhpGeodesic = {
      isVertical: true,
      center: this.constants.INFINITY,
      radius: Infinity,
      points: [],
    };

    if (z.type === "boundary") {
      const lowIntPoint = this.pointFactory(z.re, 1);
      const highIntPoint = this.pointFactory(z.re, 2);

      if (infinityFirst) {
        geodesic.points.push(
          this.constants.INFINITY,
          highIntPoint,
          lowIntPoint,
          z,
        );
      } else {
        geodesic.points.push(
          z,
          lowIntPoint,
          highIntPoint,
          this.constants.INFINITY,
        );
      }
    } else {
      const bdryPoint = this.pointFactory(z.re, 0);
      const intPoint = this.pointFactory(z.re, 2 * z.im);

      if (infinityFirst) {
        geodesic.points.push(this.constants.INFINITY, intPoint, z, bdryPoint);
      } else {
        geodesic.points.push(bdryPoint, z, intPoint, this.constants.INFINITY);
      }
    }

    return geodesic;
  }

  getGeodesicCenterAndRadius(
    z: UhpPoint,
    w: UhpPoint,
  ): { center: UhpPoint; radius: number } {
    const getRadius = (centerRe: number) => Math.hypot(z.re - centerRe, z.im);

    /**
     * Case 1: Points have the same imaginary part (up to tolerance)
     * In this case the center has real part that is the midpoint of the given points real parts
     */
    const deltaIm = w.im - z.im;
    const midpointRe = (z.re + w.re) / 2;
    if (Math.abs(deltaIm) < this._tolerance) {
      return {
        center: this.pointFactory(midpointRe, 0),
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
      center: this.pointFactory(centerRe, 0),
      radius: getRadius(centerRe),
    };
  }

  geodesicConnectingFinitePoints(z: UhpPoint, w: UhpPoint): UhpGeodesic {
    if (z.subType === "infinity" || w.subType === "infinity") {
      throw new Error("Both points must have finite real and imaginary parts");
    }

    // All cases below will use these values
    const isVertical = Math.abs(w.re - z.re) < this._tolerance;

    /**
     * Case 1: The points have the same real part (up to tolerance)
     * In this case the geodesic is the vertical line going through them.
     * The center is the point at infinity and the radius is infinite.
     * In all cases, the point at infinity is the last endpoint. If either point is an endpoint, then we can choose a second interior point using the other point. If both are interior points, then the first endpoints is the point below them on the real axis
     */
    if (isVertical) {
      const geodesic: UhpGeodesic = {
        isVertical,
        center: this.constants.INFINITY,
        radius: Infinity,
        points: [],
      };

      if (z.type === "interior" && w.type === "interior") {
        geodesic.points.push(
          this.pointFactory(z.re, 0),
          z,
          w,
          this.constants.INFINITY,
        );
      } else if (z.type === "boundary" && w.type === "interior") {
        geodesic.points.push(
          z,
          this.pointFactory(w.re, w.im / 2),
          w,
          this.constants.INFINITY,
        );
      } else if (z.type === "interior" && w.type === "boundary") {
        geodesic.points.push(
          w,
          this.pointFactory(z.re, z.im / 2),
          z,
          this.constants.INFINITY,
        );
      } else {
        throw new Error(
          "Two distinct boundary points cannot form a vertical geodesic",
        );
      }

      return geodesic;
    }

    // The order of the geodesic points in the rest of the cases depend on the relative position of z and w
    const zLeftOfW = z.re < w.re;

    /**
     * Case 2: Both points are on the boundary
     * In this case the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
     * The center is the midpoint of the two input points and the radius is half of their separation.
     * We can choose the interior points to be those points on the circle 1/4 and 3/4 of the way from z to w
     */
    if (z.type === "boundary" && w.type === "boundary") {
      const center = this.pointFactory((z.re + w.re) / 2, 0);
      const radius = Math.abs(z.re - w.re) / 2;

      const oneQuarter = this.getPointOnGeodesic(
        radius,
        center.re,
        0.25 * Math.PI,
      );
      const threeQuarter = this.getPointOnGeodesic(
        radius,
        center.re,
        0.75 * Math.PI,
      );

      const points = zLeftOfW
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
    const { center, radius } = this.getGeodesicCenterAndRadius(z, w);

    /**
     * Case 3: One point is on the boundary and one point is in the interior
     * As in the previous case, the geodesic is the the half circle connecting the two points and meeting the real axis at a right angle
     * The center lies on the real axis and is found by (i) finding the perpendicular bisector of the line connecting the two points and then (ii) finding the intersection of the perpendicular bisector with the real axis
     * The first endpoint is one of the given points and the second is the other intersection point of the geodesic with the real axis. The second interior point can be chosen to have half the argument of the first interior point
     */
    if (z.type === "interior" && w.type === "boundary") {
      const zArg = Math.atan2(z.im, z.re - center.re);
      const intPoint = this.getPointOnGeodesic(radius, center.re, zArg / 2);

      return {
        isVertical,
        center,
        radius,
        points: zLeftOfW
          ? [this.pointFactory(center.re - radius, 0), z, intPoint, w]
          : [this.pointFactory(center.re + radius, 0), intPoint, z, w],
      };
    }
    if (z.type === "boundary" && w.type === "interior") {
      const wArg = Math.atan2(w.re - center.re, w.im);
      const intPoint = this.getPointOnGeodesic(radius, center.re, wArg / 2);

      return {
        isVertical,
        center,
        radius,
        points: zLeftOfW
          ? [z, w, intPoint, this.pointFactory(center.re + radius, 0)]
          : [z, intPoint, w, this.pointFactory(center.re - radius, 0)],
      };
    }

    /**
     * Case 4: Both points are in the interior
     * This case is very similar to the previous case, except that the endpoints are a bit easier to determine since both given points are in the interior
     */
    const leftEndpoint = this.pointFactory(center.re - radius, 0);
    const rightEndpoint = this.pointFactory(center.re + radius, 0);

    return {
      isVertical,
      center,
      radius,
      points: zLeftOfW
        ? [leftEndpoint, z, w, rightEndpoint]
        : [rightEndpoint, z, w, leftEndpoint],
    };
  }

  geodesicThroughPoints(z: UhpPoint, w: UhpPoint): UhpGeodesic {
    if (z.isEqualTo(w)) {
      throw new Error("Input points must be distinct");
    }

    if (z.subType === "infinity" || w.subType === "infinity") {
      if (z.subType === "infinity" && w.subType !== "infinity") {
        return this.geodesicWithPointAtInfinity(w, true);
      }

      return this.geodesicWithPointAtInfinity(z);
    }

    return this.geodesicConnectingFinitePoints(z, w);
  }

  geodesicFromBaseAndDirection(
    base: UhpPoint,
    direction: ComplexNumber,
  ): UhpGeodesic {
    if (direction.re === Infinity && direction.im === Infinity) {
      throw new Error("The point at infinity is not a valid direction vector");
    }

    const isVertical = Math.abs(direction.re) < this._tolerance;
    if (isVertical) {
      const infinityFirst = direction.im < 0;
      return this.geodesicWithPointAtInfinity(base, infinityFirst);
    }

    const centerRe = base.re + base.im * (direction.im / direction.re);
    const center = this.pointFactory(centerRe, 0);
    const radius = Math.hypot(base.re - centerRe, base.im);

    const leftEndpoint = this.pointFactory(centerRe - radius, 0);
    const rightEndpoint = this.pointFactory(centerRe + radius, 0);
    const headingRight = direction.re > this._tolerance;

    if (base.type === "boundary") {
      const oneQuarterPoint = this.getPointOnGeodesic(
        radius,
        centerRe,
        0.25 * Math.PI,
      );
      const threeQuarterPoint = this.getPointOnGeodesic(
        radius,
        centerRe,
        0.75 * Math.PI,
      );

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
    const pointLeftOfBase = this.getPointOnGeodesic(
      radius,
      centerRe,
      (Math.PI + baseArg) / 2,
    );
    const pointRightOfBase = this.getPointOnGeodesic(
      radius,
      centerRe,
      baseArg / 2,
    );

    return {
      isVertical,
      center,
      radius,
      points: headingRight
        ? [leftEndpoint, base, pointRightOfBase, rightEndpoint]
        : [rightEndpoint, base, pointLeftOfBase, leftEndpoint],
    };
  }
  //#endregion

  // Segments
  //#region
  segmentBetweenPoints(z: UhpPoint, w: UhpPoint): UhpGeodesicSegment {
    if (z.isEqualTo(w)) {
      throw new Error("Points need to be distinct");
    }

    const geodesic = this.geodesicThroughPoints(z, w);

    if (z.subType === "infinity" || w.subType === "infinity") {
      return {
        ...geodesic,
        intAngles: null,
        intHeights: [geodesic.points[1].im, geodesic.points[2].im],
        length: Infinity,
      };
    }

    return {
      ...geodesic,
      intAngles: [
        this.positionOnGeodesic(z, geodesic),
        this.positionOnGeodesic(w, geodesic),
      ],
      intHeights: null,
      length: this.distance(z, w),
    };
  }
  //#endregion

  // Circles
  //#region
  circleCenterAndRadius(center: UhpPoint, radius: number): UhpCircle {
    if (!isPositiveNumber(radius)) {
      throw new Error("Radius must be positive");
    }

    return {
      center,
      radius,
      eucCenter: this.pointFactory(center.re, Math.cosh(radius) * center.im),
      eucRadius: Math.sinh(radius) * center.im,
    };
  }

  circleCenterAndBdryPoint(center: UhpPoint, bdryPoint: UhpPoint): UhpCircle {
    const radius = this.distance(center, bdryPoint);
    return this.circleCenterAndRadius(center, radius);
  }
  //#endregion

  // Horocycles
  //#region
  horocyleGivenCenter(center: UhpPoint): UhpHorocycle {
    if (center.subType === "infinity") {
      return {
        center,
        basePoint: this.constants.INFINITY,
        onHorPoint: this.constants.I,
        eucRadius: Infinity,
      };
    }

    return {
      center,
      basePoint: this.pointFactory(center.re, 0),
      onHorPoint: this.pointFactory(center.re, 2 * center.im),
      eucRadius: center.im,
    };
  }

  horocycleGivenBaseAndOnHor(
    basePoint: UhpPoint,
    onHorPoint: UhpPoint,
  ): UhpHorocycle {
    if (basePoint.subType === "infinity") {
      return {
        center: this.constants.INFINITY,
        basePoint,
        onHorPoint,
        eucRadius: Infinity,
      };
    }

    const eucRadius =
      ((onHorPoint.re - basePoint.re) ** 2 + onHorPoint.im ** 2) /
      (2 * onHorPoint.im);
    const center = this.pointFactory(basePoint.re, eucRadius);

    return {
      center,
      basePoint,
      onHorPoint,
      eucRadius,
    };
  }
  //#endregion

  // Polygons
  //#region
  polygonPerimeter(sides: UhpGeodesicSegment[]): number {
    return sides.reduce((perimeter, side) => perimeter + side.length, 0);
  }

  polygonArea(angles: number[]): number {
    return angles.reduce(
      (area, angle) => area - angle,
      Math.PI * (angles.length - 2),
    );
  }

  polygonFromVertices(vertices: UhpPoint[]): UhpPolygon {
    const angles: number[] = [];
    const sides: UhpGeodesicSegment[] = [];

    for (let i = 0; i < vertices.length; i++) {
      const prevPoint =
        i === 0 ? vertices[vertices.length - 1] : vertices[i - 1];
      const point = vertices[i];
      const nextPoint =
        i === vertices.length - 1 ? vertices[0] : vertices[i + 1];

      angles.push(this.angleFromThreePoints(prevPoint, point, nextPoint));
      sides.push(this.segmentBetweenPoints(point, nextPoint));
    }

    return {
      vertices,
      sides,
      angles,
      area: this.polygonArea(angles),
      perimeter: this.polygonPerimeter(sides),
    };
  }
  //#endregion
}
