import {
  ComplexNumber,
  PointAtInfinity,
  PositiveNumber,
  UhpBoundaryPoint,
  UhpInteriorPoint,
  UhpPoint,
  UhpRealLine,
} from "./types";

export const isPositiveNumber = (num: number): num is PositiveNumber => num > 0;

export const isPointAtInfinity = (z: ComplexNumber): z is PointAtInfinity =>
  z.re === Infinity || z.im === Infinity;

export const isOnRealLine = (z: ComplexNumber): z is UhpRealLine =>
  Number.isFinite(z.re) && z.im === 0;

export const isUhpInteriorPoint = (z: ComplexNumber): z is UhpInteriorPoint =>
  Number.isFinite(z.re) && Number.isFinite(z.im) && z.im > 0;

export const isUhpBoundaryPoint = (z: ComplexNumber): z is UhpBoundaryPoint => isPointAtInfinity(z) || isOnRealLine(z);

export const isUhpPoint = (z: ComplexNumber): z is UhpPoint =>
  isUhpBoundaryPoint(z) || isUhpInteriorPoint(z);

export const isPointArray = (arg: unknown): arg is [number, number] =>
  Array.isArray(arg) &&
  arg.length === 2 &&
  typeof arg[0] === "number" &&
  typeof arg[1] === "number";