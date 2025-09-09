import { UhpIsometry } from "./isometries";
import { UhpPoint } from "./points";

export function standardHyperbolic(
  distance: number,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry {
  const uhpZero = factory(0, 0);
  return new UhpIsometry(
    [
      factory(Math.exp(distance / 2), 0),
      uhpZero,
      uhpZero,
      factory(Math.exp(-distance / 2), 0),
    ],
    tolerance,
  );
}

export function standardElliptic(
  angleOfRotation: number,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry {
  const cosine = factory(Math.cos(angleOfRotation), 0);
  const sine = factory(Math.sin(angleOfRotation), 0);

  return new UhpIsometry([cosine, sine, sine.scale(-1), cosine], tolerance);
}

export function standardParabolic(
  displacement: number,
  factory: (re: number, im: number) => UhpPoint,
  tolerance: number,
): UhpIsometry {
  return new UhpIsometry(
    [factory(1, 0), factory(displacement, 0), factory(0, 0), factory(1, 0)],
    tolerance,
  );
}
