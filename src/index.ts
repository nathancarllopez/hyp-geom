import { MobiusTransformation } from "./classes/mobius-transformation";
import { ONE, toComplex, ZERO } from "./general-math/complex-numbers";
import {
  ComplexNumber,
  PointAtInfinity,
  UhpCircle,
  UhpGeodesic,
  UhpHorocycle,
  UhpInteriorPoint,
  UhpPoint,
} from "./types-validators/types";
import { isPointAtInfinity } from "./types-validators/validators";
import {
  circleCenterAndBdryPoint,
  circleCenterAndRadius,
  geodesicBetweenPoints,
  geodesicFromBaseInDirection,
  horocycleGivenBaseAndBdry,
  horocyleGivenCenter,
  I,
  toPointAtInfinity,
  toUhpBoundaryPoint,
  toUhpInteriorPoint,
  toUhpPoint,
  uhpDistance,
} from "./upper-half-plane/geometry";

export class UhpGeometry {
  /**
   * Computes the hyperbolic distance between two points in the upper half-plane.
   *
   * Returns `Infinity` if either point is on the real axis or at infinity (i.e., either the real or imaginary part is `Infinity`).
   * Throws an error if either imaginary part is negative.
   *
   * @param reZ - The real part of the first point.
   * @param imZ - The imaginary part of the first point.
   * @param reW - The real part of the second point.
   * @param imW - The imaginary part of the second point.
   * @returns The hyperbolic distance between the two points, or `Infinity` if the points are invalid.
   * @throws {Error} If either imaginary part is negative.
   */
  distance(reZ: number, imZ: number, reW: number, imW: number): number {
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

    const z = toUhpPoint(reZ, imZ);
    const w = toUhpPoint(reW, imW);

    return uhpDistance(z, w);
  }

  geodesic(
    args:
      | { reZ: number, imZ: number, reW: number, imW: number }
      | { reBase: number, imBase: number, dirX: number, dirY: number }
  ): UhpGeodesic {
    if ("reZ" in args && "imZ" in args && "reW" in args && "imW" in args) {
      const { reZ, imZ, reW, imW } = args;

      const z = toUhpPoint(reZ, imZ);
      const w = toUhpPoint(reW, imW);

      return geodesicBetweenPoints(z, w);
    }

    if ("reBase" in args && "imBase" in args && "dirX" in args && "dirY" in args) {
      const { reBase, imBase, dirX, dirY } = args;

      const base = toUhpInteriorPoint(reBase, imBase);
      const direction = toComplex(dirX, dirY);

      return geodesicFromBaseInDirection(base, direction);
    }

    throw new Error("Invalid arguments for geodesic");
  }

  /**
   * Constructs a circle in the upper half-plane model.
   *
   * The circle can be specified either by its center and radius, or by its center and a boundary point.
   *
   * @param args - An object specifying either:
   *   - `reCenter`, `imCenter`, and `radius` for center and radius, or
   *   - `reCenter`, `imCenter`, `reBdryPoint`, and `imBdryPoint` for center and a boundary point.
   * @returns The constructed circle as a {@link UhpCircle}.
   * @throws {Error} If the arguments do not match the expected format.
   */
  circle(
    args:
      | { reCenter: number; imCenter: number; radius: number }
      | {
          reCenter: number;
          imCenter: number;
          reBdryPoint: number;
          imBdryPoint: number;
        }
  ): UhpCircle {
    if ("radius" in args) {
      return circleCenterAndRadius(
        toUhpInteriorPoint(args.reCenter, args.imCenter),
        args.radius
      );
    }

    if ("reBdryPoint" in args && "imBdryPoint" in args) {
      return circleCenterAndBdryPoint(
        toUhpInteriorPoint(args.reCenter, args.imCenter),
        toUhpInteriorPoint(args.reBdryPoint, args.imBdryPoint)
      );
    }

    throw new Error("Invalid arguments for circle");
  }

  /**
   * Constructs a horocycle in the upper half-plane model.
   *
   * The horocycle can be specified either by its center (which may be a finite point or a point at infinity),
   * or by a base point on the boundary and a point on the horocycle itself.
   *
   * @param args - An object specifying either:
   *   - `reCenter` and `imCenter` for the center of the horocycle, or
   *   - `reBasePoint`, `imBasePoint`, `reHorPoint`, and `imHorPoint` for a base point and a boundary point.
   * @returns The constructed horocycle as a {@link UhpHorocycle}.
   * @throws {Error} If the arguments do not match the expected format.
   */
  horocycle(
    args:
      | { reCenter: number; imCenter: number }
      | {
          reBasePoint: number;
          imBasePoint: number;
          reHorPoint: number;
          imHorPoint: number;
        }
  ): UhpHorocycle {
    if ("reCenter" in args && "imCenter" in args) {
      const { reCenter, imCenter } = args;
      const center =
        reCenter === Infinity || imCenter === Infinity
          ? toPointAtInfinity(reCenter, imCenter)
          : toUhpInteriorPoint(reCenter, imCenter);
      return horocyleGivenCenter(center);
    }

    if (
      "reBasePoint" in args &&
      "imBasePoint" in args &&
      "reHorPoint" in args &&
      "imHorPoint" in args
    ) {
      const { reBasePoint, imBasePoint, reHorPoint, imHorPoint } = args;
      const basePoint =
        reBasePoint === Infinity || imBasePoint === Infinity
          ? toPointAtInfinity(reBasePoint, imBasePoint)
          : toUhpBoundaryPoint(reBasePoint, imBasePoint);
      return horocycleGivenBaseAndBdry(
        basePoint,
        toUhpInteriorPoint(reHorPoint, imHorPoint)
      );
    }

    throw new Error("Invalid arguments for horocycle");
  }

  isometry(coeffs: { re: number; im: number }[]): UhpIsometry {
    const complexCoeffs = coeffs.map(({ re, im }) => toComplex(re, im));
    return new UhpIsometry(...complexCoeffs);
  }

  elliptic(reCenter: number, imCenter: number, theta: number): UhpIsometry {
    const center = toUhpInteriorPoint(reCenter, imCenter);
    const moveCenterToI = UhpIsometry.movePointToI(center);
    return UhpIsometry.ellipticCenterI(theta).conjugate(moveCenterToI);
  }

  hyperbolic(
    args:
      | { reZ: number, imZ: number, reW: number, imW: number }
      | { reBase: number, imBase: number, dirX: number, dirY: number, distance: number }
      | { reInt: number, imInt: number, reBdry: number, imBdry: number, distance: number }
      | { reBdry1: number, imBdry1: number, reBdry2: number, imBdry2: number, distance: number }
  ): UhpIsometry {
    if ("reZ" in args && "imZ" in args && "reW" in args && "imW" in args) {
      throw new Error("Not yet implemented")
    }

    if (!("distance" in args)) {
      throw new Error("Invalid arguments for hyperbolic isometry");
    }

    if ("reBase" in args && "imBase" in args && "dirX" in args && "dirY" in args) {
      throw new Error("Not yet implemented")
    }

    if ("reInt" in args && "imInt" in args && "reBdry" in args && "imBdry" in args) {
      throw new Error("Not yet implemented")
    }

    if ("reBdry1" in args && "imBdry1" in args && "reBdry2" in args && "imBdry2" in args) {
      throw new Error("Not yet implemented")
    }
    
    throw new Error("Invalid arguments for hyperbolic isometry");
  }


}

export class UhpIsometry extends MobiusTransformation {
  readonly mobius: MobiusTransformation;

  constructor(a = ONE, b = ZERO, c = ZERO, d = ONE) {
    const mobius = new MobiusTransformation(a, b, c, d);
    const det = mobius.determinant();

    if (det.re === 0 && det.im === 0) {
      console.log("transformation:", mobius.coeffs);
      console.log("determinant:", det);
      throw new Error("Non-invertible transformation");
    }

    super(a, b, c, d);
    this.mobius = mobius;
  }

  compose(n: UhpIsometry): UhpIsometry {
    const composition = super.compose(n.mobius);
    return new UhpIsometry(...composition.coeffs);
  }

  conjugate(n: UhpIsometry): UhpIsometry {
    const conj = super.conjugate(n.mobius);
    return new UhpIsometry(...conj.coeffs);
  }

  inverse(): UhpIsometry {
    const mobInverse = super.inverse();
    return new UhpIsometry(...mobInverse.coeffs);
  }

  apply(z: UhpPoint): UhpPoint {
    const w = super.apply(z);
    return toUhpPoint(w.re, w.im);
  }

  static movePointToI(z: UhpInteriorPoint | PointAtInfinity): UhpIsometry {
    if (isPointAtInfinity(z)) {
      return new UhpIsometry(I, ONE, ONE, ZERO);
    }

    const moveToImAxis = new UhpIsometry(ONE, toComplex(-z.re, 0), ZERO, ONE);
    const pointOnImAxis = moveToImAxis.apply(z);
    const scaleDownToI = new UhpIsometry(
      toComplex(1 / pointOnImAxis.im, 0),
      ZERO,
      ZERO,
      ONE
    );

    return scaleDownToI.compose(moveToImAxis);
  }

  static ellipticCenterI(theta: number): UhpIsometry {
    const conj = super.unitCircleRotation(theta).conjugateByCayley();
    return new UhpIsometry(...conj.coeffs);
  }
}
