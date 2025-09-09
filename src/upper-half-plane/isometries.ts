import { ComplexNumber } from "../general-math/complex-numbers";
import {
  getMobiusTranformations,
  MobiusTransformation,
} from "../general-math/mobius-transformations";
import { isPositiveNumber } from "../util";
import {
  moveGeodesicToImAxis,
  movePointToI,
  movePointToInfinity,
} from "./conjugations";
import { getUhpFixedPoints } from "./fixed-points";
import { UhpGeometry } from "./geometry";
import { getUhpPoints, UhpPoint } from "./points";
import {
  standardElliptic,
  standardHyperbolic,
  standardParabolic,
} from "./standard-isometries";
import { UhpFixedPoints, UhpGeodesic } from "./types";

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
  public _tolerance: number;

  constructor(coeffs: ComplexNumber[] | null, tolerance: number = 1e-4) {
    if (!isPositiveNumber(tolerance)) {
      throw new Error("The tolerance must be a positive number");
    }

    const { constants: uhpConstants, factory: uhpFactory } =
      getUhpPoints(tolerance);
    const { constants: mobiusConstants } = getMobiusTranformations(tolerance);

    if (coeffs === null) {
      const identity = mobiusConstants.IDENTITY;

      super(identity.coeffs, tolerance);

      this.mobius = identity;
      this.det = 1;
      this.tr = 2;
      this.mobiusConstants = mobiusConstants;
      this.uhpConstants = uhpConstants;
      this.uhpFactory = uhpFactory;
      this.fixedPoints = null;
      this._tolerance = tolerance;
      this.type = "identity";
      this.standardForm = this;
      this.conjToStd = null;

      return;
    }

    const mobius = new MobiusTransformation(coeffs, tolerance).reduce();
    const det = mobius.determinant();
    const complexOne = new ComplexNumber(1, 0, tolerance);

    if (!det.isEqualTo(complexOne)) {
      console.log("transformation:", mobius.coeffs);
      console.log("determinant:", det);
      console.log("tolerance:", tolerance);

      throw new Error("Determinant of an isometry should be one");
    }

    const [a, , , d] = mobius.coeffs;
    const tr = a.add(d);

    if (Math.abs(tr.im) >= tolerance) {
      console.log("transformation:", mobius.coeffs);
      console.log("trace:", tr);
      console.log("tolerance:", tolerance);

      throw new Error("Trace of an isometry should be a real number");
    }

    super(mobius.coeffs, tolerance);
    this.mobius = mobius;
    this.det = det.re;
    this.tr = tr.re;
    this._tolerance = tolerance;

    this.mobiusConstants = mobiusConstants;
    this.uhpConstants = uhpConstants;
    this.uhpFactory = uhpFactory;

    const fixedPoints = getUhpFixedPoints(
      mobius,
      this.mobiusConstants.IDENTITY,
      tr.re,
      tolerance,
    );
    this.fixedPoints = fixedPoints;

    const { geodesicThroughPoints, distance, angleFromThreePoints } =
      new UhpGeometry(tolerance);
    const uhpIdentity = new UhpIsometry(null, tolerance);

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
          tolerance,
        );
        this.conjToStd = moveGeodesicToImAxis(
          fPoint0,
          fPoint1,
          uhpFactory,
          tolerance,
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
          tolerance,
        );
        this.conjToStd = movePointToI(centerOfRotation, uhpFactory, tolerance);
      }
    }

    // Parabolic transformation
    else {
      this.type = "parabolic";

      const base = fixedPoints;
      if (base.isEqualTo(uhpConstants.INFINITY)) {
        const secondCoeff = this.coeffs[1];

        if (Math.abs(secondCoeff.im) >= tolerance) {
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
          tolerance,
        );
        const thisInStandard = this.conjugate(conjToStd);
        const secondCoeff = thisInStandard.coeffs[1];

        if (Math.abs(secondCoeff.im) >= tolerance) {
          throw new Error("Parabolic displacement should be a real number");
        }

        this.standardForm = standardParabolic(
          secondCoeff.re,
          uhpFactory,
          tolerance,
        );
        this.conjToStd = conjToStd;
        this.displacement = secondCoeff.re;
      }
    }
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
    return new UhpIsometry(composition.coeffs);
  }

  conjugate(n: UhpIsometry): UhpIsometry {
    const conj = super.conjugate(n.mobius);
    return new UhpIsometry(conj.coeffs);
  }

  inverse(): UhpIsometry {
    const mobInverse = super.inverse();
    return new UhpIsometry(mobInverse.coeffs);
  }

  apply(z: UhpPoint): UhpPoint {
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
      return new UhpIsometry(null, this._tolerance);
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
          Math.abs(disp1) < this._tolerance ||
          Math.abs(disp2) < this._tolerance
        ) {
          throw new Error("Identity transformation classified as parabolic");
        }

        // Displacements need to have the same sign for the conjugation matrix to be definable
        if (disp1 * disp2 < 0) {
          return null;
        }

        const conjugateBetweenStandardForms = standardHyperbolic(
          Math.log(disp1 / disp2),
          this.uhpFactory,
          this._tolerance,
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

        if (Math.abs(tLength1 - tLength2) < this._tolerance) {
          return conjugation1.compose(conjugation2.inverse());
        }

        if (Math.abs(tLength1 + tLength2) < this._tolerance) {
          const identity = new UhpIsometry(null, this._tolerance);
          const swapZeroAndInfinity = movePointToInfinity(
            this.uhpConstants.ZERO,
            identity,
            this.uhpFactory,
            this._tolerance,
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

        if (Math.abs(angle1 - angle2) % (2 * Math.PI) < this._tolerance) {
          return conjugation1.compose(conjugation2.inverse());
        }

        return null;
      }
    }
  }
}
