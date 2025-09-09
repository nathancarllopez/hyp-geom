import { ComplexNumber } from "../general-math/complex-numbers";
import { UhpGeometry } from "./geometry";
import { UhpIsometry } from "./isometries";
import { UhpPoint } from "./points";

export function moveGeodesicToImAxis(
  base: UhpPoint,
  direction: ComplexNumber,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry;
export function moveGeodesicToImAxis(
  z: UhpPoint,
  w: UhpPoint,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry;
export function moveGeodesicToImAxis(
  arg1: UhpPoint,
  arg2: ComplexNumber | UhpPoint,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
) {
  const { geodesicThroughPoints, geodesicFromBaseAndDirection } =
    new UhpGeometry(tolerance);

  const points =
    arg2 instanceof ComplexNumber
      ? geodesicFromBaseAndDirection(arg1, arg2).points
      : geodesicThroughPoints(arg1, arg2).points;

  const ePoint0 = points[0];
  const ePoint1 = points[3];

  return new UhpIsometry(
    [factory(-1, 0), ePoint0, factory(1, 0), ePoint1.scale(-1)],
    tolerance,
  );
}

export function movePointToI(
  z: UhpPoint,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry {
  if (z.type !== "interior") {
    throw new Error("Only interior points can be moved to I");
  }

  return new UhpIsometry(
    [
      factory(1 / z.im, 0),
      factory(-z.re / z.im, 0),
      factory(0, 0),
      factory(1, 0),
    ],
    tolerance,
  );
}

export function movePointToInfinity(
  z: UhpPoint,
  identity: UhpIsometry,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry {
  if (z.subType === "infinity") return identity;

  return new UhpIsometry(
    [factory(0, 0), factory(-1, 0), factory(1, 0), z.scale(-1)],
    tolerance,
  );
}
