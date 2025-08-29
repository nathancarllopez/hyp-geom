import { describe, expect, it } from "vitest";
import { geodesicBetweenPoints, uhpDistance, I, toUpperHalfPlanePoint } from "../../src/upper-half-plane/geometry";
import { randomComplex, randomUpperHalfPlanePoint } from "../helpers/random";
import { ComplexNumber } from "../../src/types-validators/types";

describe("Upper Half Plane factory function", () => {
  it("accepts valid inputs", () => {
    expect(() => toUpperHalfPlanePoint(1, 2)).not.toThrow(
      "Imaginary part must be positive",
    );
  });

  it("rejects invalid inputs", () => {
    expect(() => toUpperHalfPlanePoint(1, -2)).toThrow(
      "Imaginary part must be positive",
    );
  });

  it("accepts random inputs", () => {
    const z = randomComplex();

    if (z.im > 0) {
      expect(() => toUpperHalfPlanePoint(z.re, z.im)).not.toThrow(
        "Imaginary part must be positive",
      );
    } else {
      expect(() => toUpperHalfPlanePoint(z.re, z.im)).toThrow(
        "Imaginary part must be positive",
      );
    }
  });
});

describe("Hyperbolic distance formula", () => {
  it("distance between i and e * i is 1", () => {
    const eI = toUpperHalfPlanePoint(0, Math.E);
    const result = uhpDistance(I, eI);

    expect(result).toBeCloseTo(1);
  });

  it("distance between a point and itself is zero", () => {
    const z = randomUpperHalfPlanePoint();
    const result = uhpDistance(z, z);

    expect(result).toBe(0);
  });

  it("distance is always nonnegative", () => {
    const z = randomUpperHalfPlanePoint();
    const w = randomUpperHalfPlanePoint();
    const result = uhpDistance(z, w);

    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("distance between points is the same regardless of input order", () => {
    const z = randomUpperHalfPlanePoint();
    const w = randomUpperHalfPlanePoint();

    const result1 = uhpDistance(z, w);
    const result2 = uhpDistance(w, z);

    expect(result1).toBeCloseTo(result2);
  });

  it("distance between points on a vertical line is (the absolute value of) the natural log of the ratio of their imaginary parts", () => {
    const z = randomUpperHalfPlanePoint();
    const randIm = Math.random() * z.im;
    const below = toUpperHalfPlanePoint(z.re, randIm);

    const result = uhpDistance(z, below);
    const manualCalc = Math.log(z.im / randIm); // We don't have to include the absolute value since z.im > randIm

    expect(result).toBeCloseTo(manualCalc);
  });
});

describe("Geodesic between two points", () => {
  it("geodesic connecting 1 + i and -1 + i", () => {
    const z = toUpperHalfPlanePoint(-1, 1);
    const w = toUpperHalfPlanePoint(1, 1);
    const expectedPoints: ComplexNumber[] = [
      { re: -Math.sqrt(2), im: 0 },
      z,
      w,
      { re: Math.sqrt(2), im: 0 },
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(z, w);

    expect(isVertical).toBe(false);
    expect(center.re).toBe(0);
    expect(center.im).toBe(0);
    expect(radius).toBeCloseTo(Math.sqrt(2));
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("geodesic connecting i and 2 + sqrt(5) * i", () => {
    const z = toUpperHalfPlanePoint(2, Math.sqrt(5));
    const expectedPoints: ComplexNumber[] = [
      { re: 2 - Math.sqrt(5), im: 0},
      I,
      z,
      { re: 2 + Math.sqrt(5), im: 0 }
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(I, z);

    expect(isVertical).toBe(false);
    expect(center.re).toBe(2);
    expect(center.im).toBe(0);
    expect(radius).toBe(Math.sqrt(5));

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("random vertical geodesic", () => {
    const z = randomUpperHalfPlanePoint();
    const w = toUpperHalfPlanePoint(z.re, z.im + 1);
    const expectedPoints: ComplexNumber[] = [
      { re: z.re, im: 0},
      z,
      w,
      { re: z.re, im: Infinity }
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(z, w);

    expect(isVertical).toBe(true);
    expect(center.re).toBe(Infinity);
    expect(center.im).toBe(Infinity);
    expect(radius).toBe(Infinity);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });
})