export type PositiveNumber = number & { __brand: "PositiveNumber" };

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isPointArray = (arg: unknown): arg is [number, number] =>
  Array.isArray(arg) &&
  arg.length === 2 &&
  typeof arg[0] === "number" &&
  typeof arg[1] === "number";