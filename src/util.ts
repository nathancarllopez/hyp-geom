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
) => Math.abs(a - b) <= atol + rtol * Math.max(Math.abs(a), Math.abs(b));
