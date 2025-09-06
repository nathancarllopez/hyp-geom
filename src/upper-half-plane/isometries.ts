import {
  add,
  argument,
  divide,
  isEqualTo,
  nthRoot,
  scale,
  subtract,
  toComplex,
} from "../general-math/complex-numbers";
import { MobiusTransformation } from "../general-math/mobius-transformations";
import {
  ComplexNumber,
  UhpBoundaryPoint,
  UhpConjugateInfo,
  UhpInteriorPoint,
  UhpIsometryInfo,
  UhpPoint,
} from "../types-validators/types";
import {
  isPointAtInfinity,
  isPositiveNumber,
  isUhpInteriorPoint,
} from "../types-validators/validators";
import {
  angleFromThreePoints,
  geodesicThroughPoints,
  I,
  NEGONE,
  ONE,
  toUhpBoundaryPoint,
  toUhpInteriorPoint,
  toUhpPoint,
  uhpDistance,
  UhpINFINITY,
  ZERO,
} from "./geometry";

export class UhpIsometry extends MobiusTransformation {
  readonly _mobius: MobiusTransformation;
  readonly _det: number;
  public _tolerance: number;

  constructor(
    a: ComplexNumber = ONE,
    b: ComplexNumber = ZERO,
    c: ComplexNumber = ZERO,
    d: ComplexNumber = ONE,
    tolerance: number = 1e-4
  ) {
    const mobius = new MobiusTransformation(a, b, c, d);
    const det = mobius.determinant();

    if (Math.abs(det.im) >= tolerance) {
      console.log("transformation:", mobius.coeffs);
      console.log("determinant:", det);
      console.log("tolerance:", tolerance);

      throw new Error("Determinant of an isometry should be a real number");
    }

    if (Math.abs(det.re) < tolerance) {
      console.log("transformation:", mobius.coeffs);
      console.log("determinant:", det);
      console.log("tolerance:", tolerance);

      throw new Error("Determinant of an isometry should be non-zero");
    }

    super(a, b, c, d);
    this._mobius = mobius;
    this._det = det.re;
    this._tolerance = tolerance;
  }

  get mobius() {
    return this._mobius;
  }

  get det() {
    return this._det;
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
    if (isPointAtInfinity(z)) {
      const [a, , c] = this.coeffs;

      if (isEqualTo(z, ZERO, this._tolerance)) {
        return UhpINFINITY;
      }

      const quotient = divide(a, c);
      return toUhpPoint(quotient.re, quotient.im);
    }

    const w = super.apply(z);
    return toUhpPoint(w.re, w.im);
  }

  // A Mobius transformation is determined by where it sends three points
  isEqualTo(n: UhpIsometry): boolean {
    const testPoints = [ONE, ZERO, I];

    for (const point of testPoints) {
      const z = this.apply(point);
      const w = n.apply(point);

      if (!isEqualTo(z, w, this._tolerance)) {
        return false;
      }
    }

    return true;
  }

  trace(): number {
    const [a, , , d] = this.reduce().coeffs;
    const tr = add(a, d);

    if (!isEqualTo(tr, { re: tr.re, im: 0 }, this._tolerance)) {
      throw new Error("The trace of an isometry should be a real number");
    }

    return tr.re;
  }

  fixedPoints():
    | [UhpBoundaryPoint, UhpBoundaryPoint]
    | UhpBoundaryPoint
    | UhpInteriorPoint {
    const [a, , c, d] = this.coeffs;
    const tr = this.trace();

    const fPointFormula = (plus: boolean = true): UhpPoint => {
      if (isEqualTo(c, ZERO, this._tolerance)) {
        return UhpINFINITY;
      }

      const discriminant = tr ** 2 - 4;
      let rootTerm = nthRoot({ re: discriminant, im: 0 });
      if (!plus) rootTerm = scale(rootTerm, -1);

      const fPoint = divide(add(subtract(a, d), rootTerm), scale(c, 2));

      return toUhpPoint(fPoint.re, fPoint.im);
    };

    const isParabolic = Math.abs(tr ** 2 - 4) < this._tolerance;
    if (isParabolic) {
      const fPoint = fPointFormula();

      if (Math.abs(fPoint.im) < this.tolerance) {
        return toUhpBoundaryPoint(fPoint.re, 0);
      }

      throw new Error("Fixed point of a parabolic should be a boundary point");
    }

    const isHyperbolic = tr ** 2 > 4;
    if (isHyperbolic) {
      const fPoints = [fPointFormula(false), fPointFormula()];

      if (
        fPoints.some(
          ({ im }) => im !== Infinity || Math.abs(im) >= this._tolerance
        )
      ) {
        throw new Error(
          "Fixed points of a hyperbolic should be boundary points"
        );
      }

      return [
        toUhpBoundaryPoint(fPoints[0].re, fPoints[0].im),
        toUhpBoundaryPoint(fPoints[1].re, fPoints[1].im),
      ];
    }

    const fPoint = fPointFormula();
    return toUhpInteriorPoint(fPoint.re, fPoint.im);
  }

  classify(): UhpIsometryInfo {
    const identity = new UhpIsometry();
    const isIdentity = this.isEqualTo(identity);

    // The only way this is true is if the isometry is a scalar multiple of the identity
    if (isIdentity) {
      const firstCoeff = this.coeffs[0];
      const conjFirstCoeff = divide(ONE, firstCoeff);

      return {
        type: "identity",
        original: this,
        standard: identity,
        conjugation: new UhpIsometry(conjFirstCoeff, ZERO, ZERO, ONE),
        fixedPoints: null,
      };
    }

    // Isometries are determined by their fixed points
    const fixedPoints = this.fixedPoints();
    if (Array.isArray(fixedPoints)) {
      const axisOfTranslation = geodesicThroughPoints(...fixedPoints);
      const z = axisOfTranslation.points[1];
      const w = this.apply(z);

      const translationLength = uhpDistance(z, w);
      const standard =
        UhpIsometry.hyperbolicMovingIVertically(translationLength);
      const conjugation = UhpIsometry.moveGeodesicToImAxis(z, w);

      return {
        type: "hyperbolic",
        original: this,
        standard,
        conjugation,
        fixedPoints,
        translationLength,
        axisOfTranslation,
      };
    }

    if (isUhpInteriorPoint(fixedPoints)) {
      const z = toUhpInteriorPoint(fixedPoints.re + 1, fixedPoints.im);
      const w = this.apply(z);

      const angleOfRotation = angleFromThreePoints(z, fixedPoints, w);
      const standard = UhpIsometry.ellipticCenterI(angleOfRotation);
      const conjugation = UhpIsometry.moveIntPointToI(fixedPoints);

      return {
        type: "elliptic",
        original: this,
        standard,
        conjugation,
        fixedPoints,
        angleOfRotation,
      };
    }

    const conjugation = UhpIsometry.movePointToInfinity(fixedPoints);
    const conjugatedIsom = this.conjugate(conjugation);
    const normalizedSecondCoeff = divide(
      conjugatedIsom.coeffs[1],
      conjugatedIsom.coeffs[0]
    );

    if (normalizedSecondCoeff.im >= this._tolerance) {
      throw new Error("Parabolic displacement should be a real number");
    }

    const parabolicDisplacement = normalizedSecondCoeff.re;
    const standard = UhpIsometry.parabolicAtInfinity(parabolicDisplacement);

    return {
      type: "parabolic",
      original: this,
      standard,
      conjugation,
      fixedPoints,
      parabolicDisplacement,
    };
  }

  isConjugateTo(n: UhpIsometry): UhpConjugateInfo {
    const { type: type1, conjugation: conjugation1 } = this.classify();
    const { type: type2, conjugation: conjugation2 } = this.classify();

    if (type1 !== type2) {
      return {
        isConjugate: false,
        conjugation: null,
      };
    }

    const type = type1;
    switch (type) {
      case "identity": {
        return {
          isConjugate: true,
          conjugation: null,
        };
      }

      case "parabolic": {
        return {
          isConjugate: true,
          conjugation: null,
        };
      }

      case "hyperbolic": {
        return {
          isConjugate: true,
          conjugation: null,
        };
      }

      case "elliptic": {
        return {
          isConjugate: true,
          conjugation: null,
        };
      }
    }
  }

  static moveIntPointToI(z: UhpInteriorPoint): UhpIsometry {
    const moveToImAxis = new UhpIsometry(ONE, { re: -z.re, im: 0 }, ZERO, ONE);
    const pointOnImAxis = moveToImAxis.apply(z);
    const scaleDownToI = new UhpIsometry(
      { re: 1 / pointOnImAxis.im, im: 0 },
      ZERO,
      ZERO,
      ONE
    );

    return scaleDownToI.compose(moveToImAxis);
  }

  static movePointToInfinity(z: UhpBoundaryPoint): UhpIsometry {
    if (isPointAtInfinity(z)) {
      return new UhpIsometry(); // Return the identity if point is already at infinity
    }

    return new UhpIsometry(ZERO, ONE, ONE, scale(z, -1));
  }

  static movePointToZero(z: UhpBoundaryPoint): UhpIsometry {
    if (isPointAtInfinity(z)) {
      return new UhpIsometry(ZERO, ONE, NEGONE, ZERO);
    }

    return new UhpIsometry(ONE, scale(z, -1), ZERO, ONE);
  }

  // static rotatePointToImAxis(z: UhpPoint): UhpIsometry {
  //   if (z.re === 0) {
  //     return new UhpIsometry(); // Return the identity if point already lies on im-axis
  //   }

  //   const angleAtIWithImAxis = angleFromThreePoints(z, I, toUhpInteriorPoint(0, 2));

  //   if (z.re < 0) {
  //     return UhpIsometry.ellipticCenterI(-angleAtIWithImAxis);
  //   }

  //   return UhpIsometry.ellipticCenterI(angleAtIWithImAxis);
  // }

  static moveGeodesicToImAxis(
    z: UhpPoint,
    dir: { x: number; y: number }
  ): UhpIsometry;
  static moveGeodesicToImAxis(z: UhpPoint, w: UhpPoint): UhpIsometry;
  static moveGeodesicToImAxis(
    z: UhpPoint,
    arg: { x: number; y: number } | UhpPoint
  ): UhpIsometry {
    // First overload
    if ("x" in arg && "y" in arg) {
      const moveZ = isUhpInteriorPoint(z)
        ? UhpIsometry.moveIntPointToI(z)
        : UhpIsometry.movePointToZero(z);

      if (arg.x === 0) return moveZ;

      const dir = toComplex(arg.x, arg.y);
      const rotateDirToUp = UhpIsometry.ellipticCenterI(
        Math.PI / 2 - argument(dir)
      );

      return rotateDirToUp.compose(moveZ);
    }

    // Second overload
    const w = arg;
    const geodesicToMove = geodesicThroughPoints(z, w);
    const [ePoint0, , , ePoint1] = geodesicToMove.points;

    // This sends ePoint0 to zero and ePoint1 to the point at infinity
    return new UhpIsometry(NEGONE, ePoint0, ONE, scale(ePoint1, -1));
  }

  static ellipticCenterI(theta: number): UhpIsometry {
    const conj = super.unitCircleRotation(theta).conjugateByCayley();
    return new UhpIsometry(...conj.coeffs);
  }

  static hyperbolicMovingIVertically(distance: number): UhpIsometry {
    return new UhpIsometry({ re: Math.exp(distance), im: 0 }, ZERO, ZERO, ONE);
  }

  static parabolicAtInfinity(distance: number): UhpIsometry {
    return new UhpIsometry(ONE, { re: distance, im: 0 }, ZERO, ONE);
  }
}
