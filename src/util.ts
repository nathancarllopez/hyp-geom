import { getComplexNumbers } from "./general-math/complex-numbers";
import { UhpGeometry } from "./upper-half-plane/geometry";
import { getUhpPoints } from "./upper-half-plane/points";

export type PositiveNumber = number & { __brand: "PositiveNumber" };

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isPointArray = (arg: unknown): arg is [number, number] =>
  Array.isArray(arg) &&
  arg.length === 2 &&
  typeof arg[0] === "number" &&
  typeof arg[1] === "number";

export function initializeUhpPrivateFields(tolerance: number) {
  const { factory: uhpFactory } = getUhpPoints(tolerance);
  const { factory: complexFactory } = getComplexNumbers(tolerance);

  return {
    uhpFactory,
    complexFactory,
    geometry: new UhpGeometry(tolerance),
  };
}
