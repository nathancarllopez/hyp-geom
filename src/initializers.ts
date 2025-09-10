import { getComplexNumbers } from "./general-math/complex-numbers.js";
import { UhpGeometry } from "./upper-half-plane/geometry.js";
import { getUhpPoints } from "./upper-half-plane/points.js";

export function initializeUhpPrivateFields(
  rtol: number = 1e-5,
  atol: number = 1e-8,
) {
  const { factory: uhpFactory } = getUhpPoints(rtol, atol);
  const { factory: complexFactory } = getComplexNumbers(rtol, atol);

  return {
    uhpFactory,
    complexFactory,
    geometry: new UhpGeometry(rtol, atol),
  };
}
