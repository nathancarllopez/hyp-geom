export type PositiveNumber = number & { __brand: "PositiveNumber" };

export const isPositiveNumber = (num: unknown): num is PositiveNumber => typeof num === "number" && num > 0;

export const isPointArray = (arg: unknown): arg is [number, number] =>
  Array.isArray(arg) &&
  arg.length === 2 &&
  typeof arg[0] === "number" &&
  typeof arg[1] === "number";

export const nearlyEqual = (
  a: number,
  b: number,
  rtol: number = 1e-5,
  atol: number = 1e-8,
): boolean => {
  if (!isPositiveNumber(rtol) || !isPositiveNumber(atol)) {
    throw new Error("Tolerances must be positive");
  }

  if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) {
    return a === b;
  }

  const absDiff = Math.abs(a - b);
  const relMultiplier = Math.max(Math.abs(a), Math.abs(b));
  const toleranceExpression = atol + rtol * relMultiplier;

  return absDiff <= toleranceExpression;
};

export const anglesEquivalent = (
  a: number,
  b: number,
  atol: number = 1e-8,
): boolean => {
  if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) {
    throw new Error("Angles cannot be infinite");
  }

  if (!isPositiveNumber(atol)) {
    throw new Error("Absolute tolerance must be positive");
  }

  let diff = Math.abs(a - b);
  diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;

  return Math.abs(diff) < atol;
};
