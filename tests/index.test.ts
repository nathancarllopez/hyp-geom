import { describe, expect, it } from "vitest";
import { randomUpperHalfPlanePoint } from "./helpers/random";
import { elliptic } from "../src";
import { apply } from "../src/upper-half-plane/isometries";
import { toUpperHalfPlanePoint, uhpDistance } from "../src/upper-half-plane/geometry";

describe("Elliptic isometry", () => {
  it("Rotating by pi about z = a + i*b sends u = a + i*(b*e) to v = a + i*(b/e)", () => {
    const center = randomUpperHalfPlanePoint();
    const u = toUpperHalfPlanePoint(center.re, center.im * Math.E);
    const v = toUpperHalfPlanePoint(center.re, center.im / Math.E);

    const halfRot = elliptic(center.re, center.im, Math.PI);
    const result = apply(halfRot, u);

    expect(result.re).toBeCloseTo(v.re);
    expect(result.im).toBeCloseTo(v.im);
  });

  it("Rotating by 0 leaves the point unchanged", () => {
    const center = randomUpperHalfPlanePoint();
    const z = randomUpperHalfPlanePoint();
    const rot = elliptic(center.re, center.im, 0);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotating by 2*pi leaves the point unchanged", () => {
    const center = randomUpperHalfPlanePoint();
    const z = randomUpperHalfPlanePoint();
    const rot = elliptic(center.re, center.im, 2 * Math.PI);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotations that differ by a multiple of 2*pi are identical", () => {
    const center = randomUpperHalfPlanePoint();
    const z = randomUpperHalfPlanePoint();
    const theta = Math.random() * 2 * Math.PI;
    const rot = elliptic(center.re, center.im, theta);
    const result = apply(rot, z);

    for (let k = -5; k <= 5; k++) {
      const otherTheta = theta + k * 2 * Math.PI;
      const otherRot = elliptic(center.re, center.im, otherTheta);
      const otherResult = apply(otherRot, z);

      expect(otherResult.re).toBeCloseTo(result.re);
      expect(otherResult.im).toBeCloseTo(result.im);
    }
  });

  it("Rotating preserves the distance between a point and i", () => {
    const center = randomUpperHalfPlanePoint();
    const z = randomUpperHalfPlanePoint();
    const distBefore = uhpDistance(center, z);

    const theta = Math.random() * 2 * Math.PI;
    const rot = elliptic(center.re, center.im, theta);
    const result = apply(rot, z);
    const distAfter = uhpDistance(center, result);

    expect(distBefore).toBeCloseTo(distAfter);
  });
})