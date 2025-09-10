export type PositiveNumber = number & { __brand: "PositiveNumber" };

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isPointArray = (arg: unknown): arg is [number, number] =>
  Array.isArray(arg) &&
  arg.length === 2 &&
  typeof arg[0] === "number" &&
  typeof arg[1] === "number";

export const nearlyEqual = (
  a: number,
  b: number,
  rtol: number = 1e-5,
  atol: number = 1e-8
): boolean => {
  const absDiff = Math.abs(a - b);
  const relMultiplier = Math.max(Math.abs(a), Math.abs(b));
  const toleranceExpression = atol + rtol * relMultiplier;

  return absDiff <= toleranceExpression;
}

export const anglesEquivalent = (
  a: number,
  b: number,
  atol: number = 1e-8
): boolean => {
  let diff = a - b;
  diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;

  return Math.abs(diff) < atol;
};
