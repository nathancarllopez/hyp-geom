import { describe, it, expect } from "vitest";
import { getUhpFixedPoints } from "../../src/upper-half-plane/fixed-points.js";
import { MobiusTransformation } from "../../src/general-math/mobius-transformations.js";

describe("getUhpFixedPoints", () => {
  const identity = new MobiusTransformation([1, 0, 0, 1]);

  const makeMobius = (a: number, b: number, c: number, d: number) =>
    new MobiusTransformation([a, b, c, d]);

  it("returns null for identity transformation", () => {
    const result = getUhpFixedPoints(identity, identity, 2);
    expect(result).toBeNull();
  });

  it("throws error for non-positive tolerances", () => {
    const m = makeMobius(2, 0, 1, 1);
    expect(() => getUhpFixedPoints(m, identity, 2, -1, 1e-8)).toThrow();
    expect(() => getUhpFixedPoints(m, identity, 2, 1e-5, 0)).toThrow();
  });

  it("returns INFINITY for parabolic with c = 0", () => {
    const m = makeMobius(3, 0, 0, 1); // c = 0
    const result = getUhpFixedPoints(m, identity, 4);
    expect(result).toHaveProperty("isInfinity");
    expect(result.isInfinity()).toBe(true);
  });

  it("returns boundary point for parabolic with c ≠ 0", () => {
    const m = makeMobius(3, 0, 1, 1); // c ≠ 0
    const result = getUhpFixedPoints(m, identity, 4);
    expect(result.im).toBeCloseTo(0, 8);
  });

  it("returns [ZERO, INFINITY] for hyperbolic with c = 0", () => {
    const m = makeMobius(5, 0, 0, 1); // c = 0, tr^2 > 4
    const result = getUhpFixedPoints(m, identity, 5);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].isZero()).toBe(true);
    expect(result[1].isInfinity()).toBe(true);
  });

  it("returns two boundary points for hyperbolic with c ≠ 0", () => {
    const m = makeMobius(5, 0, 1, 1); // c ≠ 0, tr^2 > 4
    const result = getUhpFixedPoints(m, identity, 5);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].im).toBeCloseTo(0, 8);
    expect(result[1].im).toBeCloseTo(0, 8);
  });

  it("returns a point for elliptic case", () => {
    const m = makeMobius(1, 0, 1, 1); // tr^2 < 4
    const result = getUhpFixedPoints(m, identity, 2);
    expect(result).toHaveProperty("re");
    expect(result).toHaveProperty("im");
    expect(result.im).not.toBeCloseTo(0, 8);
  });
});
