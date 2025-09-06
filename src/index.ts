import { toComplex } from "./general-math/complex-numbers";
import { UhpCircle, UhpGeodesic, UhpHorocycle, UhpPolygon } from "./types-validators/types";
import {
  isPointArray,
  isPointAtInfinity,
  isPositiveNumber,
  isUhpBoundaryPoint,
  isUhpInteriorPoint,
} from "./types-validators/validators";
import {
  circleCenterAndBdryPoint,
  circleCenterAndRadius,
  geodesicThroughPoints,
  geodesicFromBaseAndDirection,
  horocycleGivenBaseAndOnHor,
  horocyleGivenCenter,
  toUhpInteriorPoint,
  toUhpPoint,
  uhpDistance,
  polygonFromVertices,
} from "./upper-half-plane/geometry";
import { UhpIsometry } from "./upper-half-plane/isometries";

export class UhpGeometry {
  public _tolerance: number;

  constructor(tolerance = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("Tolerance must be positive")
    }
    this._tolerance = tolerance;
  }

  get tolerance() {
    return this._tolerance;
  }

  set tolerance(newTolerance: number) {
    if (!isPositiveNumber(newTolerance)) {
      throw new Error("Tolerance must be positive")
    }
    this._tolerance = newTolerance;
  }

  distance(z: [number, number], w: [number, number]): number {
    const [reZ, imZ] = z;
    const [reW, imW] = w;

    if (imZ < 0 || imW < 0) {
      throw new Error("Imaginary parts cannot be negative");
    }

    if (
      reZ === Infinity ||
      reZ === -Infinity ||
      reW === Infinity ||
      reW === -Infinity ||
      imZ === 0 ||
      imZ === Infinity ||
      imW === 0 ||
      imW === Infinity
    )
      return Infinity;

    return uhpDistance(toUhpPoint(reZ, imZ), toUhpPoint(reW, imW));
  }

  geodesic(z: [number, number], w: [number, number]): UhpGeodesic;
  geodesic(base: [number, number], dir: { x: number; y: number }): UhpGeodesic;
  geodesic(
    arg1: [number, number],
    arg2: [number, number] | { x: number; y: number }
  ): UhpGeodesic {
    const uhp1 = toUhpPoint(arg1[0], arg1[1]);

    if (isPointArray(arg2)) {
      const uhp2 = toUhpPoint(arg2[0], arg2[1]);
      return geodesicThroughPoints(uhp1, uhp2, this.tolerance);
    }

    if (isPointAtInfinity(uhp1)) {
      throw new Error("Base cannot be infinite");
    }

    const complexDir = toComplex(arg2.x, arg2.y);
    return geodesicFromBaseAndDirection(uhp1, complexDir);
  }

  circle(center: [number, number], radius: number): UhpCircle;
  circle(center: [number, number], bdryPoint: [number, number]): UhpCircle;
  circle(center: [number, number], args: number | [number, number]): UhpCircle {
    const [reCenter, imCenter] = center;

    if (typeof args === "number") {
      const radius = args;
      return circleCenterAndRadius(
        toUhpInteriorPoint(reCenter, imCenter),
        radius
      );
    }

    if (isPointArray(args)) {
      const [reBdryPoint, imBdryPoint] = args;
      return circleCenterAndBdryPoint(
        toUhpInteriorPoint(reCenter, imCenter),
        toUhpInteriorPoint(reBdryPoint, imBdryPoint)
      );
    }

    throw new Error("Invalid arguments for circle");
  }

  horocycle(center: [number, number]): UhpHorocycle;
  horocycle(base: [number, number], onHorPoint: [number, number]): UhpHorocycle;
  horocycle(arg1: [number, number], arg2?: [number, number]): UhpHorocycle {
    if (arg2 === undefined) {
      const center = toUhpPoint(arg1[0], arg1[1]);

      if (isUhpBoundaryPoint(center)) {
        throw new Error("Center of horocycle cannot be infinite");
      }

      return horocyleGivenCenter(center);
    }

    const base = toUhpPoint(arg1[0], arg1[1]);
    const onHorPoint = toUhpInteriorPoint(arg2[0], arg2[1]);

    if (isUhpInteriorPoint(base)) {
      throw new Error(
        "Base of horocycle cannot be inside the hyperbolic plane"
      );
    }

    return horocycleGivenBaseAndOnHor(base, onHorPoint);
  }

  polygon(vertices: [number, number][]): UhpPolygon {
    const uhpVertices = vertices.map(([re, im]) => toUhpPoint(re, im));
    return polygonFromVertices(uhpVertices, this.tolerance);
  }

  isometry(coeffs: [number, number][]): UhpIsometry {
    const complexCoeffs = coeffs.map(([re, im]) => toComplex(re, im));
    return new UhpIsometry(...complexCoeffs);
  }

  elliptic(center: [number, number], theta: number): UhpIsometry {
    const uhpCenter = toUhpInteriorPoint(center[0], center[1]);
    const moveCenterToI = UhpIsometry.moveIntPointToI(uhpCenter);
    return UhpIsometry.ellipticCenterI(theta).conjugate(moveCenterToI);
  }

  // Private hyperbolic functions for each overload signature below
  //#region
  private hyperbolicTwoInteriorPoints(
    z: [number, number],
    w: [number, number]
  ): UhpIsometry {
    const uhpZ = toUhpPoint(z[0], z[1]);
    const uhpW = toUhpPoint(w[0], w[1]);

    if (isPointAtInfinity(uhpZ)) {
      throw new Error("First point cannot be the point at infinity");
    }

    if (
      isPointAtInfinity(uhpW) ||
      isUhpBoundaryPoint(uhpZ) ||
      isUhpBoundaryPoint(uhpW)
    ) {
      throw new Error(
        "Both inputs need to be inside the hyperbolic plane if no translation distance is provided"
      );
    }

    if (uhpZ.re === uhpW.re && uhpZ.im === uhpW.im) {
      return new UhpIsometry(); // Return the identity if the points coincide
    }

    const moveToImAxis = UhpIsometry.moveGeodesicToImAxis(uhpZ, uhpW);
    const distance = Math.log(moveToImAxis.apply(uhpW).im);

    return UhpIsometry.hyperbolicMovingIVertically(distance).conjugate(
      moveToImAxis
    );
  }
  private hyperbolicTwoPointsAndDistance(
    z: [number, number],
    w: [number, number],
    distance: number
  ): UhpIsometry {
    const uhpZ = toUhpPoint(z[0], z[1]);

    if (isPointAtInfinity(uhpZ)) {
      throw new Error("First point cannot be the point at infinity");
    }

    const uhpW = toUhpPoint(w[0], w[1]);

    if (distance === 0 || (uhpZ.re === uhpW.re && uhpZ.im === uhpW.im)) {
      return new UhpIsometry(); // Return the identity if the translation distance is zero or the points coincide
    }

    const moveToImAxis = UhpIsometry.moveGeodesicToImAxis(uhpZ, uhpW);

    return UhpIsometry.hyperbolicMovingIVertically(distance).conjugate(
      moveToImAxis
    );
  }
  private hyperbolicPointDirectionDistance(
    base: [number, number],
    dir: { x: number; y: number },
    distance: number
  ): UhpIsometry {
    const uhpBase = toUhpPoint(base[0], base[1]);

    if (isPointAtInfinity(uhpBase)) {
      throw new Error("First point cannot be the point at infinity");
    }

    if (distance === 0 || (dir.x === 0 && dir.y === 0)) {
      return new UhpIsometry(); // Return the identity if the translation distance is zero or the zero vector is given as the direction
    }

    const moveToImAxis = UhpIsometry.moveGeodesicToImAxis(uhpBase, dir);

    return UhpIsometry.hyperbolicMovingIVertically(distance).conjugate(
      moveToImAxis
    );
  }
  private hyperbolicPointDirection(
    base: [number, number],
    dir: { x: number; y: number }
  ): UhpIsometry {
    const distance = Math.hypot(dir.x, dir.y);
    return this.hyperbolicPointDirectionDistance(base, dir, distance);
  }
  //#endregion

  hyperbolic(z: [number, number], w: [number, number]): UhpIsometry;
  hyperbolic(
    z: [number, number],
    w: [number, number],
    distance: number
  ): UhpIsometry;
  hyperbolic(
    base: [number, number],
    dir: { x: number; y: number }
  ): UhpIsometry;
  hyperbolic(
    base: [number, number],
    dir: { x: number; y: number },
    distance: number
  ): UhpIsometry;
  hyperbolic(
    arg1: [number, number],
    arg2: [number, number] | { x: number; y: number },
    arg3?: number
  ): UhpIsometry {
    if (isPointArray(arg2)) {
      if (arg3 === undefined) {
        // Overload 1
        return this.hyperbolicTwoInteriorPoints(arg1, arg2);
      }

      // Overload 2
      return this.hyperbolicTwoPointsAndDistance(arg1, arg2, arg3);
    }

    if (arg3 === undefined) {
      // Overload 3
      return this.hyperbolicPointDirection(arg1, arg2);
    }

    // Overload 4
    return this.hyperbolicPointDirectionDistance(arg1, arg2, arg3);
  }

  parabolic(bdry: [number, number], distance: number): UhpIsometry {
    const bdryPoint = toUhpPoint(bdry[0], bdry[1]);

    if (isUhpInteriorPoint(bdryPoint)) {
      throw new Error("Boundary point cannot be inside the hyperbolic plane");
    }

    const moveBdryToInfinity = UhpIsometry.movePointToInfinity(bdryPoint);

    return UhpIsometry.parabolicAtInfinity(distance).conjugate(
      moveBdryToInfinity
    );
  }
}
