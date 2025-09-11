import { ComplexNumber } from "./general-math/complex-numbers.js";
import { initializeUhpPrivateFields } from "./initializers.js";
import {
  moveGeodesicToImAxis,
  movePointToI,
  movePointToInfinity,
} from "./upper-half-plane/conjugations.js";
import { UhpGeometry } from "./upper-half-plane/geometry.js";
import { UhpIsometry } from "./upper-half-plane/isometries.js";
import { UhpPoint } from "./upper-half-plane/points.js";
import {
  standardElliptic,
  standardHyperbolic,
  standardParabolic,
} from "./upper-half-plane/standard-isometries.js";
import {
  UhpCircle,
  UhpGeodesic,
  UhpHorocycle,
  UhpPolygon,
} from "./upper-half-plane/types.js";
import { isPointArray, isPositiveNumber } from "./util.js";

export const STANDARD_RELATIVE_TOLERANCE: number = 1e-5;
export const STANDARD_ABSOLUTE_TOLERANCE: number = 1e-8;

export class UpperHalfPlane {
  private uhpFactory: (re: number, im: number) => UhpPoint;
  private complexFactory: (re: number, im: number) => ComplexNumber;
  private geometry: UhpGeometry;
  public _rtol: number;
  public _atol: number;

  constructor(
    rtol: number = STANDARD_RELATIVE_TOLERANCE,
    atol: number = STANDARD_ABSOLUTE_TOLERANCE
  ) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    const { uhpFactory, complexFactory, geometry } = initializeUhpPrivateFields(
      rtol,
      atol
    );

    this.uhpFactory = uhpFactory;
    this.complexFactory = complexFactory;
    this.geometry = geometry;
    this._rtol = rtol;
    this._atol = atol;
  }

  get rtol() {
    return this._rtol;
  }
  get atol() {
    return this._atol;
  }
  set rtol(newRtol: number) {
    if (!isPositiveNumber(newRtol)) {
      throw new Error("Relative tolerance must be positive");
    }
    this._rtol = newRtol;
  }
  set atol(newAtol: number) {
    if (!isPositiveNumber(newAtol)) {
      throw new Error("Relative tolerance must be positive");
    }
    this._atol = newAtol;
  }

  point(arg: [number, number] | UhpPoint): UhpPoint {
    return isPointArray(arg) ? this.uhpFactory(arg[0], arg[1]) : arg;
  }

  distance(
    arg1: UhpPoint | [number, number],
    arg2: UhpPoint | [number, number]
  ): number {
    const z = isPointArray(arg1) ? this.uhpFactory(arg1[0], arg1[1]) : arg1;
    const w = isPointArray(arg2) ? this.uhpFactory(arg2[0], arg2[1]) : arg2;

    return this.geometry.distance(z, w);
  }

  angle(
    arg1: UhpPoint | [number, number],
    arg2: UhpPoint | [number, number],
    arg3: UhpPoint | [number, number]
  ): number {
    const p = isPointArray(arg1) ? this.uhpFactory(arg1[0], arg1[1]) : arg1;
    const q = isPointArray(arg2) ? this.uhpFactory(arg2[0], arg2[1]) : arg2;
    const r = isPointArray(arg3) ? this.uhpFactory(arg3[0], arg3[1]) : arg3;

    return this.geometry.angleFromThreePoints(p, q, r);
  }

  geodesic(
    z: [number, number] | UhpPoint,
    w: [number, number] | UhpPoint
  ): UhpGeodesic;
  geodesic(
    base: [number, number] | UhpPoint,
    direction: { x: number; y: number }
  ): UhpGeodesic;
  geodesic(
    arg1: [number, number] | UhpPoint,
    arg2: [number, number] | UhpPoint | { x: number; y: number }
  ): UhpGeodesic {
    const uhp1 = isPointArray(arg1) ? this.uhpFactory(arg1[0], arg1[1]) : arg1;

    if (isPointArray(arg2) || arg2 instanceof UhpPoint) {
      const uhp2 = isPointArray(arg2)
        ? this.uhpFactory(arg2[0], arg2[1])
        : arg2;
      return this.geometry.geodesicThroughPoints(uhp1, uhp2);
    }

    if (uhp1.subType === "infinity") {
      throw new Error("Base cannot be infinite");
    }

    if ("x" in arg2 && "y" in arg2) {
      const direction = this.complexFactory(arg2.x, arg2.y);
      return this.geometry.geodesicFromBaseAndDirection(uhp1, direction);
    }

    throw new Error("Invalid arguments for geodesic");
  }

  circle(center: [number, number] | UhpPoint, radius: number): UhpCircle;
  circle(
    center: [number, number] | UhpPoint,
    bdryPoint: [number, number] | UhpPoint
  ): UhpCircle;
  circle(
    arg1: [number, number] | UhpPoint,
    arg2: number | [number, number] | UhpPoint
  ): UhpCircle {
    const center = isPointArray(arg1)
      ? this.uhpFactory(arg1[0], arg1[1])
      : arg1;

    if (typeof arg2 === "number") {
      return this.geometry.circleCenterAndRadius(center, arg2);
    }

    if (isPointArray(arg2) || arg2 instanceof UhpPoint) {
      const bdryPoint = isPointArray(arg2)
        ? this.uhpFactory(arg2[0], arg2[1])
        : arg2;
      return this.geometry.circleCenterAndBdryPoint(center, bdryPoint);
    }

    throw new Error("Invalid arguments for circle");
  }

  horocycle(center: [number, number] | UhpPoint): UhpHorocycle;
  horocycle(
    base: [number, number] | UhpPoint,
    onHorPoint: [number, number] | UhpPoint
  ): UhpHorocycle;
  horocycle(
    arg1: [number, number] | UhpPoint,
    arg2?: [number, number] | UhpPoint
  ): UhpHorocycle {
    if (arg2 === undefined) {
      const center = isPointArray(arg1)
        ? this.uhpFactory(arg1[0], arg1[1])
        : arg1;

      if (center.type === "boundary") {
        throw new Error("Center of horocycle should be an interior point");
      }

      return this.geometry.horocyleGivenCenter(center);
    }

    const base = isPointArray(arg1) ? this.uhpFactory(arg1[0], arg1[1]) : arg1;
    const onHorPoint = isPointArray(arg2)
      ? this.uhpFactory(arg2[0], arg2[1])
      : arg2;

    if (base.type === "interior") {
      throw new Error(
        "Base of horocycle cannot be inside the hyperbolic plane"
      );
    }

    return this.geometry.horocycleGivenBaseAndOnHor(base, onHorPoint);
  }

  polygon(vertices: [number, number][] | UhpPoint[]): UhpPolygon {
    const uhpVertices: UhpPoint[] = vertices.map((v) =>
      isPointArray(v) ? this.uhpFactory(v[0], v[1]) : v
    );
    return this.geometry.polygonFromVertices(uhpVertices);
  }

  isometry(coeffs: [number, number][] | ComplexNumber[]): UhpIsometry {
    const complexCoeffs: ComplexNumber[] = coeffs.map((c) =>
      isPointArray(c) ? this.complexFactory(c[0], c[1]) : c
    );
    return new UhpIsometry(complexCoeffs, this._rtol, this._atol);
  }

  elliptic(center: [number, number] | UhpPoint, theta: number): UhpIsometry {
    const uhpCenter = isPointArray(center)
      ? this.uhpFactory(center[0], center[1])
      : center;
    const moveCenterToI = movePointToI(
      uhpCenter,
      this.uhpFactory,
      this._rtol,
      this._atol
    );
    const standard = standardElliptic(
      theta,
      this.uhpFactory,
      this._rtol,
      this._atol
    );

    return standard.conjugate(moveCenterToI);
  }

  // Private hyperbolic functions for each overload signature below
  //#region
  private hyperbolicTwoInteriorPoints(
    z: [number, number] | UhpPoint,
    w: [number, number] | UhpPoint
  ): UhpIsometry {
    const uhpZ = isPointArray(z) ? this.uhpFactory(z[0], z[1]) : z;
    const uhpW = isPointArray(w) ? this.uhpFactory(w[0], w[1]) : w;

    if (uhpZ.type === "boundary" || uhpW.type === "boundary") {
      throw new Error(
        "Both inputs need to be inside the hyperbolic plane if no translation distance is provided"
      );
    }

    if (uhpZ.isEqualTo(uhpW)) {
      return new UhpIsometry(null, this._rtol, this._atol); // Return the identity if the points coincide
    }

    const moveToImAxis = moveGeodesicToImAxis(
      uhpZ,
      uhpW,
      this.uhpFactory,
      this._rtol,
      this._atol
    );
    const distance = Math.log(moveToImAxis.apply(uhpW).im);
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicTwoPointsAndDistance(
    z: [number, number] | UhpPoint,
    w: [number, number] | UhpPoint,
    distance: number
  ): UhpIsometry {
    const uhpZ = isPointArray(z) ? this.uhpFactory(z[0], z[1]) : z;
    const uhpW = isPointArray(w) ? this.uhpFactory(w[0], w[1]) : w;

    if (distance === 0 || uhpZ.isEqualTo(uhpW)) {
      return new UhpIsometry(null, this._rtol, this._atol); // Return the identity if the translation distance is zero or the points coincide
    }

    const moveToImAxis = moveGeodesicToImAxis(
      uhpZ,
      uhpW,
      this.uhpFactory,
      this._rtol,
      this._atol
    );
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicPointDirectionDistance(
    base: [number, number] | UhpPoint,
    direction: { x: number; y: number },
    distance: number
  ): UhpIsometry {
    const uhpBase = isPointArray(base)
      ? this.uhpFactory(base[0], base[1])
      : base;

    if (distance === 0 || (direction.x === 0 && direction.y === 0)) {
      return new UhpIsometry(null, this._rtol, this._atol); // Return the identity if the translation distance is zero or the zero vector is given as the direction
    }

    const complexDir = this.complexFactory(direction.x, direction.y);
    const moveToImAxis = moveGeodesicToImAxis(
      uhpBase,
      complexDir,
      this.uhpFactory,
      this._rtol,
      this._atol
    );
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicPointDirection(
    base: [number, number] | UhpPoint,
    direction: { x: number; y: number }
  ): UhpIsometry {
    const distance = Math.hypot(direction.x, direction.y);
    return this.hyperbolicPointDirectionDistance(base, direction, distance);
  }
  //#endregion

  hyperbolic(
    z: [number, number] | UhpPoint,
    w: [number, number] | UhpPoint
  ): UhpIsometry;
  hyperbolic(
    z: [number, number] | UhpPoint,
    w: [number, number] | UhpPoint,
    distance: number
  ): UhpIsometry;
  hyperbolic(
    base: [number, number] | UhpPoint,
    direction: { x: number; y: number },
    distance: number
  ): UhpIsometry;
  hyperbolic(
    base: [number, number] | UhpPoint,
    direction: { x: number; y: number }
  ): UhpIsometry;
  hyperbolic(
    arg1: [number, number] | UhpPoint,
    arg2: [number, number] | UhpPoint | { x: number; y: number },
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
      if ("x" in arg2 && "y" in arg2) {
        return this.hyperbolicPointDirection(arg1, arg2);
      }

      throw new Error("Invalid second parameter");
    }

    // Overload 4
    if ("x" in arg2 && "y" in arg2) {
      return this.hyperbolicPointDirectionDistance(arg1, arg2, arg3);
    }

    throw new Error("Invalid second parameter");
  }

  parabolic(
    bdry: [number, number] | UhpPoint,
    displacement: number
  ): UhpIsometry {
    const bdryPoint = isPointArray(bdry)
      ? this.uhpFactory(bdry[0], bdry[1])
      : bdry;

    if (bdryPoint.type === "interior") {
      throw new Error("Boundary point cannot be inside the hyperbolic plane");
    }

    const identity = new UhpIsometry(null, this._rtol, this._atol);
    const moveBdryToInfinity = movePointToInfinity(
      bdryPoint,
      identity,
      this.uhpFactory,
      this._rtol,
      this._atol
    );
    const standard = standardParabolic(
      displacement,
      this.uhpFactory,
      this._rtol,
      this._atol
    );

    return standard.conjugate(moveBdryToInfinity);
  }

  areConjugate(m: UhpIsometry, n: UhpIsometry): UhpIsometry | null {
    return m.isConjugateTo(n);
  }
}
