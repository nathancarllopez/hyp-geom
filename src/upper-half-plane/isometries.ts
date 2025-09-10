import { ComplexNumber } from "../general-math/complex-numbers.js";
import {
  getMobiusTranformations,
  MobiusTransformation,
} from "../general-math/mobius-transformations.js";
import { anglesEquivalent, isPointArray, isPositiveNumber, nearlyEqual } from "../util.js";
import {
  moveGeodesicToImAxis,
  movePointToI,
  movePointToInfinity,
} from "./conjugations.js";
import { getUhpFixedPoints } from "./fixed-points.js";
import { UhpGeometry } from "./geometry.js";
import { getUhpPoints, UhpPoint } from "./points.js";
import {
  standardElliptic,
  standardHyperbolic,
  standardParabolic,
} from "./standard-isometries.js";
import { UhpFixedPoints, UhpGeodesic } from "./types.js";

export class UhpIsometry extends MobiusTransformation {
  private mobiusConstants: Record<string, MobiusTransformation>;
  private uhpConstants: Record<string, UhpPoint>;
  private uhpFactory: (re: number, im: number) => UhpPoint;
  readonly mobius: MobiusTransformation;
  readonly det: number;
  readonly tr: number;
  readonly type: "hyperbolic" | "elliptic" | "parabolic" | "identity";
  readonly fixedPoints: UhpFixedPoints;
  readonly standardForm: UhpIsometry;
  readonly conjToStd: UhpIsometry | null; // is null when isometry is the identity to prevent infinite recursion in constructor
  readonly translationLength?: number;
  readonly axisOfTranslation?: UhpGeodesic;
  readonly angleOfRotation?: number;
  readonly displacement?: number;
  public _rtol: number;
  public _atol: number;

  constructor(
    coeffs: ComplexNumber[] | null,
    rtol: number = 1e-5,
    atol: number = 1e-8,
  ) {
    if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
      throw new Error("Tolerances must be positive");
    }

    const { constants: uhpConstants, factory: uhpFactory } = getUhpPoints(
      rtol,
      atol,
    );
    const { constants: mobiusConstants } = getMobiusTranformations(rtol, atol);

    if (coeffs === null) {
      const identity = mobiusConstants.IDENTITY;

      super(identity.coeffs, rtol, atol);

      this.mobius = identity;
      this.det = 1;
      this.tr = 2;
      this.mobiusConstants = mobiusConstants;
      this.uhpConstants = uhpConstants;
      this.uhpFactory = uhpFactory;
      this.fixedPoints = null;
      this._rtol = rtol;
      this._atol = atol;
      this.type = "identity";
      this.standardForm = this;
      this.conjToStd = null;

      return;
    }

    const mobius = new MobiusTransformation(coeffs, rtol, atol).reduce();
    const det = mobius.determinant();
    const complexOne = new ComplexNumber(1, 0, rtol, atol);

    if (!det.isEqualTo(complexOne)) {
      console.log("transformation:", mobius.coeffs);
      console.log("determinant:", det);
      console.log("tolerance:", rtol, atol);

      throw new Error("Determinant of an isometry should be one");
    }

    const [a, , , d] = mobius.coeffs;
    const tr = a.add(d);

    if (!nearlyEqual(tr.im, 0, rtol, atol)) {
      console.log("transformation:", mobius.coeffs);
      console.log("trace:", tr);
      console.log("tolerance:", rtol, atol);

      throw new Error("Trace of an isometry should be a real number");
    }

    super(mobius.coeffs, rtol, atol);
    this.mobius = mobius;
    this.det = det.re;
    this.tr = tr.re;
    this._rtol = rtol;
    this._atol = atol;

    this.mobiusConstants = mobiusConstants;
    this.uhpConstants = uhpConstants;
    this.uhpFactory = uhpFactory;

    const fixedPoints = getUhpFixedPoints(
      mobius,
      this.mobiusConstants.IDENTITY,
      tr.re,
      rtol,
      atol,
    );
    this.fixedPoints = fixedPoints;

    const { geodesicThroughPoints, distance, angleFromThreePoints } =
      new UhpGeometry(rtol, atol);
    const uhpIdentity = new UhpIsometry(null, rtol, atol);

    // Identity transformation
    if (fixedPoints === null) {
      this.type = "identity";

      this.standardForm = this;
      this.conjToStd = null;
    }

    // Hyperbolic transformation
    else if (Array.isArray(fixedPoints)) {
      this.type = "hyperbolic";

      const [fPoint0, fPoint1] = fixedPoints;
      const axisOfTranslation = geodesicThroughPoints(fPoint0, fPoint1);
      const intPoint = axisOfTranslation.points[1];
      const imageOfIntPoint = this.apply(intPoint);
      const translationLength = distance(intPoint, imageOfIntPoint);

      this.axisOfTranslation = axisOfTranslation;
      this.translationLength = translationLength;

      if (
        fPoint0.isEqualTo(uhpConstants.ZERO) &&
        fPoint1.isEqualTo(uhpConstants.INFINITY)
      ) {
        this.standardForm = this;
        this.conjToStd = uhpIdentity;
      } else {
        this.standardForm = standardHyperbolic(
          translationLength,
          uhpFactory,
          rtol,
          atol,
        );
        this.conjToStd = moveGeodesicToImAxis(
          fPoint0,
          fPoint1,
          uhpFactory,
          rtol,
          atol,
        );
      }
    }

    // Elliptic transformation
    else if (fixedPoints.type === "interior") {
      this.type = "elliptic";

      const centerOfRotation = fixedPoints;
      const intPoint = this.uhpFactory(
        centerOfRotation.re,
        centerOfRotation.im + 1,
      );
      const imageOfIntPoint = this.apply(intPoint);
      const angleOfRotation = angleFromThreePoints(
        intPoint,
        centerOfRotation,
        imageOfIntPoint,
      );

      this.angleOfRotation = angleOfRotation;

      if (centerOfRotation.isEqualTo(uhpConstants.I)) {
        this.standardForm = this;
        this.conjToStd = uhpIdentity;
      } else {
        this.standardForm = standardElliptic(
          angleOfRotation,
          uhpFactory,
          rtol,
          atol,
        );
        this.conjToStd = movePointToI(centerOfRotation, uhpFactory, rtol, atol);
      }
    }

    // Parabolic transformation
    else {
      this.type = "parabolic";

      const base = fixedPoints;
      if (base.isEqualTo(uhpConstants.INFINITY)) {
        const secondCoeff = this.coeffs[1];

        if (!nearlyEqual(secondCoeff.im, 0, rtol, atol)) {
          throw new Error("Parabolic displacement should be a real number");
        }

        this.standardForm = this;
        this.conjToStd = uhpIdentity;
        this.displacement = secondCoeff.re;
      } else {
        const conjToStd = movePointToInfinity(
          base,
          uhpIdentity,
          uhpFactory,
          rtol,
          atol,
        );
        const thisInStandard = this.conjugate(conjToStd);
        const secondCoeff = thisInStandard.coeffs[1];

        if (!nearlyEqual(secondCoeff.im, 0, rtol, atol)) {
          throw new Error("Parabolic displacement should be a real number");
        }

        this.standardForm = standardParabolic(
          secondCoeff.re,
          uhpFactory,
          rtol,
          atol,
        );
        this.conjToStd = conjToStd;
        this.displacement = secondCoeff.re;
      }
    }
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

  compose(n: UhpIsometry): UhpIsometry {
    const composition = super.compose(n.mobius);
    return new UhpIsometry(composition.coeffs, this._rtol, this._atol);
  }

  conjugate(n: UhpIsometry): UhpIsometry {
    const conj = super.conjugate(n.mobius);
    return new UhpIsometry(conj.coeffs, this._rtol, this._atol);
  }

  inverse(): UhpIsometry {
    const mobInverse = super.inverse();
    return new UhpIsometry(mobInverse.coeffs, this._rtol, this._atol);
  }

  apply(z: [number, number]): UhpPoint;
  apply(z: UhpPoint): UhpPoint;
  apply(arg: [number, number] | UhpPoint) {
    let z: UhpPoint;

    if (isPointArray(arg)) {
      z = this.uhpFactory(arg[0], arg[1]);
    } else if (arg instanceof UhpPoint) {
      z = arg;
    } else {
      throw new Error("Invalid arguments for apply");
    }

    if (z.subType === "infinity") {
      const [a, , c] = this.coeffs;

      if (c.isEqualTo(this.uhpConstants.ZERO)) {
        return this.uhpConstants.INFINITY;
      }

      const quotient = a.divide(c);
      return this.uhpFactory(quotient.re, quotient.im);
    }

    const w = super.apply(z);
    return this.uhpFactory(w.re, w.im);
  }

  isConjugateTo(n: UhpIsometry): UhpIsometry | null {
    const { type: type1, conjToStd: conjugation1 } = this;
    const { type: type2, conjToStd: conjugation2 } = n;

    if (type1 !== type2) {
      return null;
    }

    const type = type1;
    if (type === "identity") {
      return new UhpIsometry(null, this._rtol, this._atol);
    }

    if (conjugation1 === null || conjugation2 === null) {
      throw new Error(
        "Non trivial isometries should not have a null conjugation matrix",
      );
    }

    switch (type) {
      case "parabolic": {
        const { displacement: disp1 } = this;
        const { displacement: disp2 } = n;

        if (disp1 === undefined || disp2 === undefined) {
          throw new Error(
            "Parabolic isometries should have a parabolic displacement",
          );
        }

        if (
          nearlyEqual(disp1, 0, this._rtol, this._atol) ||
          nearlyEqual(disp2, 0, this._rtol, this._atol)
        ) {
          throw new Error("Identity transformation classified as parabolic");
        }

        // Displacements need to have the same sign for the conjugation matrix to be definable
        if ((disp1 > 0 && disp2 < 0) || (disp1 < 0 && disp2 > 0)) {
          return null;
        }

        const conjugateBetweenStandardForms = standardHyperbolic(
          Math.log(disp1 / disp2),
          this.uhpFactory,
          this._rtol,
          this._atol,
        );
        const conjugation = conjugation1.compose(
          conjugateBetweenStandardForms.compose(conjugation2.inverse()),
        );

        return conjugation;
      }

      case "hyperbolic": {
        const { translationLength: tLength1 } = this;
        const { translationLength: tLength2 } = n;

        if (tLength1 === undefined || tLength2 === undefined) {
          throw new Error(
            "Hyperbolic isometries should have a translation length",
          );
        }

        if (nearlyEqual(tLength1, tLength2, this._rtol, this._atol)) {
          return conjugation1.compose(conjugation2.inverse());
        }

        if (nearlyEqual(tLength1, -tLength2, this._rtol, this._atol)) {
          const identity = new UhpIsometry(null, this._rtol, this._atol);
          const swapZeroAndInfinity = movePointToInfinity(
            this.uhpConstants.ZERO,
            identity,
            this.uhpFactory,
            this._rtol,
            this._atol,
          );
          const conjugation = conjugation1.compose(
            swapZeroAndInfinity.compose(conjugation2.inverse()),
          );

          return conjugation;
        }

        return null;
      }

      case "elliptic": {
        const { angleOfRotation: angle1 } = this;
        const { angleOfRotation: angle2 } = n;

        if (angle1 === undefined || angle2 === undefined) {
          throw new Error(
            "Elliptic isometries should have an angle of rotation",
          );
        }

        if (anglesEquivalent(angle1, angle2, this._atol)) {
          return conjugation1.compose(conjugation2.inverse());
        }

        return null;
      }
    }
  }
}
