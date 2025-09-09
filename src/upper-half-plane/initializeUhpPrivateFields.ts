import { getComplexNumbers } from "../general-math/complex-numbers.js";
import { UhpGeometry } from "./geometry.js";
import { getUhpPoints } from "./points.js";

export function initializeUhpPrivateFields(tolerance: number) {
  const { factory: uhpFactory } = getUhpPoints(tolerance);
  const { factory: complexFactory } = getComplexNumbers(tolerance);

  return {
    uhpFactory,
    complexFactory,
    geometry: new UhpGeometry(tolerance),
  };
}
