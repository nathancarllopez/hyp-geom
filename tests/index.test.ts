import { describe, expect, it } from "vitest";
import { UhpGeometry } from "../src";
import { randomUhpBoundaryPoint, randomUhpInteriorPoint } from "./helpers/random";
import {
  circleCenterAndBdryPoint,
  circleCenterAndRadius,
  geodesicBetweenPoints,
  horocycleGivenBaseAndBdry,
  horocyleGivenCenter,
  toPointAtInfinity,
  toUhpBoundaryPoint,
  uhpDistance,
} from "../src/upper-half-plane/geometry";

describe("UhpGeometry class", () => {
  it("distance between two points", () => {
    const z = randomUhpInteriorPoint();
    const w = randomUhpInteriorPoint();
    const dist = uhpDistance(z, w);

    const uhp = new UhpGeometry();
    const result = uhp.distance(z.re, z.im, w.re, w.im);

    expect(result).toBe(dist);
  });

  it("distance returns Infinity for points on the real axis or at infinity", () => {
    const uhp = new UhpGeometry();

    // imZ = 0 (on real axis)
    expect(uhp.distance(1, 0, 2, 1)).toBe(Infinity);

    // imW = 0 (on real axis)
    expect(uhp.distance(1, 1, 2, 0)).toBe(Infinity);

    // reZ = Infinity
    expect(uhp.distance(Infinity, 1, 2, 1)).toBe(Infinity);

    // reW = -Infinity
    expect(uhp.distance(1, 1, -Infinity, 2)).toBe(Infinity);

    // imZ = Infinity
    expect(uhp.distance(1, Infinity, 2, 1)).toBe(Infinity);

    // imW = Infinity
    expect(uhp.distance(1, 1, 2, Infinity)).toBe(Infinity);
  });

  it("geodesic between two points", () => {
    const z = randomUhpInteriorPoint();
    const w = randomUhpInteriorPoint();
    const geodesic = geodesicBetweenPoints(z, w);

    const uhp = new UhpGeometry();
    const result = uhp.geodesic(z.re, z.im, w.re, w.im);

    expect(result).toEqual(geodesic);
  });

  it("geodesic throws error for invalid inputs", () => {
    const uhp = new UhpGeometry();

    // Negative imaginary parts for geodesic should throw
    expect(() => uhp.geodesic(1, -1, 2, 1)).toThrow();
    expect(() => uhp.geodesic(1, 1, 2, -1)).toThrow();
    expect(() => uhp.geodesic(1, -1, 2, -1)).toThrow();

    // Both points are the same (degenerate geodesic)
    expect(() => uhp.geodesic(1, 1, 1, 1)).toThrow();
  });

  it("circle from center and radius", () => {
    const center = randomUhpInteriorPoint();
    const radius = 1e2 * Math.random();
    const circle = circleCenterAndRadius(center, radius);

    const uhp = new UhpGeometry();
    const result = uhp.circle({
      reCenter: center.re,
      imCenter: center.im,
      radius,
    });

    expect(result).toEqual(circle);
  });

  it("circle from center and bdry point", () => {
    const center = randomUhpInteriorPoint();
    const bdryPoint = randomUhpInteriorPoint();
    const circle = circleCenterAndBdryPoint(center, bdryPoint);

    const uhp = new UhpGeometry();
    const result = uhp.circle({
      reCenter: center.re,
      imCenter: center.im,
      reBdryPoint: bdryPoint.re,
      imBdryPoint: bdryPoint.im
    });

    expect(result).toEqual(circle);
  });

  it("circle throws error for invalid arguments", () => {
    const uhp = new UhpGeometry();

    // Missing required properties
    expect(() =>
      uhp.circle({ reCenter: 1, imCenter: 1 } as any)
    ).toThrowError("Invalid arguments for circle");

    // Passing unrelated properties
    expect(() =>
      uhp.circle({ foo: 1, bar: 2 } as any)
    ).toThrowError("Invalid arguments for circle");
  });

  it("horocycle from finite center", () => {
    const center = randomUhpInteriorPoint();
    const uhp = new UhpGeometry();

    const result = uhp.horocycle({
      reCenter: center.re,
      imCenter: center.im,
    });

    // Should match the direct construction
    expect(result).toEqual(horocyleGivenCenter(center));
  });

  it("horocycle from center at infinity", () => {
    const uhp = new UhpGeometry();

    const result = uhp.horocycle({
      reCenter: Infinity,
      imCenter: Infinity,
    });

    const center = toPointAtInfinity(Infinity, Infinity);
    expect(result).toEqual(horocyleGivenCenter(center));
  });

  it("horocycle from base point and horocycle point (finite base)", () => {
    const base = randomUhpBoundaryPoint();
    const horPoint = randomUhpInteriorPoint();
    const uhp = new UhpGeometry();

    const result = uhp.horocycle({
      reBasePoint: base.re,
      imBasePoint: base.im,
      reHorPoint: horPoint.re,
      imHorPoint: horPoint.im,
    });

    const basePoint = toUhpBoundaryPoint(base.re, base.im);
    expect(result).toEqual(horocycleGivenBaseAndBdry(basePoint, horPoint));
  });

  it("horocycle from base point at infinity", () => {
    const horPoint = randomUhpInteriorPoint();
    const uhp = new UhpGeometry();

    const result = uhp.horocycle({
      reBasePoint: Infinity,
      imBasePoint: Infinity,
      reHorPoint: horPoint.re,
      imHorPoint: horPoint.im,
    });

    const basePoint = toPointAtInfinity(Infinity, Infinity);
    expect(result).toEqual(horocycleGivenBaseAndBdry(basePoint, horPoint));
  });

  it("horocycle throws error for invalid arguments", () => {
    const uhp = new UhpGeometry();

    // Missing required properties
    expect(() =>
      uhp.horocycle({ reCenter: 1 } as any)
    ).toThrowError("Invalid arguments for horocycle");

    // Passing unrelated properties
    expect(() =>
      uhp.horocycle({ foo: 1, bar: 2 } as any)
    ).toThrowError("Invalid arguments for horocycle");
  });
});
