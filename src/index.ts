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

export class UpperHalfPlane {
  private uhpFactory: (re: number, im: number) => UhpPoint;
  private complexFactory: (re: number, im: number) => ComplexNumber;
  private geometry: UhpGeometry;
  public _rtol: number;
  public _atol: number;

  constructor(rtol: number = 1e-5, atol: number = 1e-8) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    const { uhpFactory, complexFactory, geometry } = initializeUhpPrivateFields(
      rtol,
      atol,
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

  distance(z: [number, number], w: [number, number]): number {
    return this.geometry.distance(
      this.uhpFactory(z[0], z[1]),
      this.uhpFactory(w[0], w[1]),
    );
  }

  angle(p: [number, number], q: [number, number], r: [number, number]): number {
    return this.geometry.angleFromThreePoints(
      this.uhpFactory(p[0], p[1]),
      this.uhpFactory(q[0], q[1]),
      this.uhpFactory(r[0], r[1]),
    );
  }

  point(z: [number, number]): UhpPoint {
    return this.uhpFactory(z[0], z[1]);
  }

  geodesic(z: [number, number], w: [number, number]): UhpGeodesic;
  geodesic(
    base: [number, number],
    direction: { x: number; y: number },
  ): UhpGeodesic;
  geodesic(
    arg1: [number, number],
    arg2: [number, number] | { x: number; y: number },
  ): UhpGeodesic {
    const uhp1 = this.uhpFactory(arg1[0], arg1[1]);

    if (isPointArray(arg2)) {
      const uhp2 = this.uhpFactory(arg2[0], arg2[1]);
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

  circle(center: [number, number], radius: number): UhpCircle;
  circle(center: [number, number], bdryPoint: [number, number]): UhpCircle;
  circle(center: [number, number], arg: number | [number, number]): UhpCircle {
    const [reCenter, imCenter] = center;

    if (typeof arg === "number") {
      return this.geometry.circleCenterAndRadius(
        this.uhpFactory(reCenter, imCenter),
        arg,
      );
    }

    if (isPointArray(arg)) {
      const [reBdryPoint, imBdryPoint] = arg;
      return this.geometry.circleCenterAndBdryPoint(
        this.uhpFactory(reCenter, imCenter),
        this.uhpFactory(reBdryPoint, imBdryPoint),
      );
    }

    throw new Error("Invalid arguments for circle");
  }

  horocycle(center: [number, number]): UhpHorocycle;
  horocycle(base: [number, number], onHorPoint: [number, number]): UhpHorocycle;
  horocycle(arg1: [number, number], arg2?: [number, number]): UhpHorocycle {
    if (arg2 === undefined) {
      const center = this.uhpFactory(arg1[0], arg1[1]);

      if (center.type === "boundary") {
        throw new Error("Center of horocycle should be an interior point");
      }

      return this.geometry.horocyleGivenCenter(center);
    }

    const base = this.uhpFactory(arg1[0], arg1[1]);
    const onHorPoint = this.uhpFactory(arg2[0], arg2[1]);

    if (base.type === "interior") {
      throw new Error(
        "Base of horocycle cannot be inside the hyperbolic plane",
      );
    }

    return this.geometry.horocycleGivenBaseAndOnHor(base, onHorPoint);
  }

  polygon(vertices: [number, number][]): UhpPolygon {
    const uhpVertices = vertices.map(([re, im]) => this.uhpFactory(re, im));
    return this.geometry.polygonFromVertices(uhpVertices);
  }

  isometry(coeffs: [number, number][]): UhpIsometry {
    const complexCoeffs = coeffs.map(([re, im]) => this.complexFactory(re, im));
    return new UhpIsometry(complexCoeffs, this._rtol, this._atol);
  }

  elliptic(center: [number, number], theta: number): UhpIsometry {
    const uhpCenter = this.uhpFactory(center[0], center[1]);
    const moveCenterToI = movePointToI(
      uhpCenter,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );
    const standard = standardElliptic(
      theta,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );

    return standard.conjugate(moveCenterToI);
  }

  // Private hyperbolic functions for each overload signature below
  //#region
  private hyperbolicTwoInteriorPoints(
    z: [number, number],
    w: [number, number],
  ): UhpIsometry {
    const uhpZ = this.uhpFactory(z[0], z[1]);
    const uhpW = this.uhpFactory(w[0], w[1]);

    if (uhpZ.type === "boundary" || uhpW.type === "boundary") {
      throw new Error(
        "Both inputs need to be inside the hyperbolic plane if no translation distance is provided",
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
      this._atol,
    );
    const distance = Math.log(moveToImAxis.apply(uhpW).im);
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicTwoPointsAndDistance(
    z: [number, number],
    w: [number, number],
    distance: number,
  ): UhpIsometry {
    const uhpZ = this.uhpFactory(z[0], z[1]);
    const uhpW = this.uhpFactory(w[0], w[1]);

    if (distance === 0 || uhpZ.isEqualTo(uhpW)) {
      return new UhpIsometry(null, this._rtol, this._atol); // Return the identity if the translation distance is zero or the points coincide
    }

    const moveToImAxis = moveGeodesicToImAxis(
      uhpZ,
      uhpW,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicPointDirectionDistance(
    base: [number, number],
    direction: { x: number; y: number },
    distance: number,
  ): UhpIsometry {
    const uhpBase = this.uhpFactory(base[0], base[1]);

    if (distance === 0 || (direction.x === 0 && direction.y === 0)) {
      return new UhpIsometry(null, this._rtol, this._atol); // Return the identity if the translation distance is zero or the zero vector is given as the direction
    }

    const complexDir = this.complexFactory(direction.x, direction.y);
    const moveToImAxis = moveGeodesicToImAxis(
      uhpBase,
      complexDir,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );
    const standard = standardHyperbolic(
      distance,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );

    return standard.conjugate(moveToImAxis);
  }
  private hyperbolicPointDirection(
    base: [number, number],
    direction: { x: number; y: number },
  ): UhpIsometry {
    const distance = Math.hypot(direction.x, direction.y);
    return this.hyperbolicPointDirectionDistance(base, direction, distance);
  }
  //#endregion

  hyperbolic(z: [number, number], w: [number, number]): UhpIsometry;
  hyperbolic(
    z: [number, number],
    w: [number, number],
    distance: number,
  ): UhpIsometry;
  hyperbolic(
    base: [number, number],
    direction: { x: number; y: number },
  ): UhpIsometry;
  hyperbolic(
    base: [number, number],
    direction: { x: number; y: number },
    distance: number,
  ): UhpIsometry;
  hyperbolic(
    arg1: [number, number],
    arg2: [number, number] | { x: number; y: number },
    arg3?: number,
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

  parabolic(bdry: [number, number], displacement: number): UhpIsometry {
    const bdryPoint = this.uhpFactory(bdry[0], bdry[1]);

    if (bdryPoint.type === "interior") {
      throw new Error("Boundary point cannot be inside the hyperbolic plane");
    }

    const identity = new UhpIsometry(null, this._rtol, this._atol);
    const moveBdryToInfinity = movePointToInfinity(
      bdryPoint,
      identity,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );
    const standard = standardParabolic(
      displacement,
      this.uhpFactory,
      this._rtol,
      this._atol,
    );

    return standard.conjugate(moveBdryToInfinity);
  }

  areConjugate(m: UhpIsometry, n: UhpIsometry): UhpIsometry | null {
    return m.isConjugateTo(n);
  }
}
