import { MobiusTransformation } from "../general-math/mobius-transformations.js";
import { isPositiveNumber, nearlyEqual } from "../util.js";
import { getUhpPoints, UhpPoint } from "./points.js";
import { UhpFixedPoints } from "./types.js";

export function getUhpFixedPoints(
  m: MobiusTransformation,
  identity: MobiusTransformation,
  tr: number,
  rtol: number = 1e-5,
  atol: number = 1e-8
): UhpFixedPoints {
  if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
    throw new Error("Tolerances must be positive");
  }

  if (m.isEqualTo(identity)) return null;

  const { constants, factory } = getUhpPoints(rtol, atol);

  const [a, , c, d] = m.coeffs;
  const cIsZero = c.isEqualTo(constants.ZERO);

  const fPointFormula = (plus: boolean = true): UhpPoint => {
    const discriminant = tr ** 2 - 4;
    let rootTerm = factory(discriminant, 0).principalNthRoot();
    if (!plus) rootTerm = rootTerm.scale(-1);

    const numerator = a.subtract(d).add(rootTerm);
    const denominator = c.scale(2);
    const fPoint = numerator.divide(denominator);

    return factory(fPoint.re, fPoint.im);
  };

  const isParabolic = nearlyEqual(tr, 4, rtol, atol);
  if (isParabolic) {
    if (cIsZero) {
      return constants.INFINITY;
    }

    const fPoint = fPointFormula();

    if (nearlyEqual(fPoint.im, 0, rtol, atol)) {
      return factory(fPoint.re, 0);
    }

    throw new Error("Fixed point of a parabolic should be a boundary point");
  }

  const isHyperbolic = tr ** 2 > 4;
  if (isHyperbolic) {
    if (cIsZero) {
      return [constants.ZERO, constants.INFINITY];
    }

    const fPoints = [fPointFormula(false), fPointFormula()];

    if (
      fPoints.some(
        ({ im }) => Number.isFinite(im) && !nearlyEqual(im, 0, rtol, atol)
      )
    ) {
      throw new Error("Fixed points of a hyperbolic should be boundary points");
    }

    return [
      factory(fPoints[0].re, fPoints[0].im),
      factory(fPoints[1].re, fPoints[1].im),
    ];
  }

  // Is Elliptic
  const fPoint = fPointFormula();
  return factory(fPoint.re, fPoint.im);
}
