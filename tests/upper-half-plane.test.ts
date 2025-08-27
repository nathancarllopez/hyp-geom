import { describe, expect, it } from "vitest";
import { hypDistance, I, upperHalfPlane } from "../src/upper-half-plane";
import { randomComplex, randomUpperHalfPlanePoint } from "./helpers/random";

describe("Upper Half Plane factory function", () => {
  it("accepts valid inputs", () => {
    expect(() => upperHalfPlane(1, 2)).not.toThrow("Imaginary part must be positive");
  });

  it("rejects invalid inputs", () => {
    expect(() => upperHalfPlane(1, -2)).toThrow("Imaginary part must be positive");
  });

  it("accepts random inputs", () => {
    const z = randomComplex();

    if (z.im > 0) {
      expect(() => upperHalfPlane(z.re, z.im)).not.toThrow("Imaginary part must be positive");
    } else {
      expect(() => upperHalfPlane(z.re, z.im)).toThrow("Imaginary part must be positive");
    }
  })
});

describe("Hyperbolic distance formula", () => {
  it("distance between i and e * i is 1", () => {
    const eI = upperHalfPlane(0, Math.E);
    const result = hypDistance(I, eI);

    expect(result).toBeCloseTo(1);
  });

  it("distance between a point and itself is zero", () => {
    const z = randomUpperHalfPlanePoint();
    const result = hypDistance(z, z);

    expect(result).toBe(0);
  })

  it("distance is always nonnegative", () => {
    const z = randomUpperHalfPlanePoint();
    const w = randomUpperHalfPlanePoint();
    const result = hypDistance(z, w);

    expect(result).toBeGreaterThanOrEqual(0);
  })

  it("distance between points is the same regardless of input order", () => {
    const z = randomUpperHalfPlanePoint();
    const w = randomUpperHalfPlanePoint();

    const result1 = hypDistance(z, w);
    const result2 = hypDistance(w, z);

    expect(result1).toBeCloseTo(result2);
  })

  it("distance between points on a vertical line is (the absolute value of) the natural log of the ratio of their imaginary parts", () => {
    const z = randomUpperHalfPlanePoint();
    const randIm = Math.random() * z.im
    const below = upperHalfPlane(z.re, randIm);
    
    const result = hypDistance(z, below);
    const manualCalc = Math.log(z.im / randIm) // We don't have to include the absolute value since z.im > randIm

    expect(result).toBeCloseTo(manualCalc);
  })
});