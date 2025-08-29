import { describe, expect, it } from "vitest";
import { I, toUpperHalfPlanePoint, uhpDistance } from "../../src/upper-half-plane/geometry";
import { ellipticAboutI, apply } from "../../src/upper-half-plane/isometries";
import { randomUpperHalfPlanePoint } from "../helpers/random";

describe("Rotations about i", () => {
  it("Rotating by pi sends e*i to (1 / e)*i", () => {
    const z = toUpperHalfPlanePoint(0, Math.E);
    const halfRot = ellipticAboutI(Math.PI);
    const result = apply(halfRot, z);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(1 / Math.E);
  });

  it("Rotating by 0 leaves the point unchanged", () => {
    const z = randomUpperHalfPlanePoint();
    const rot = ellipticAboutI(0);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotating by 2*pi leaves the point unchanged", () => {
    const z = randomUpperHalfPlanePoint();
    const rot = ellipticAboutI(2 * Math.PI);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotations that differ by a multiple of 2*pi are identical", () => {
    const z = randomUpperHalfPlanePoint();
    const theta = Math.random() * 2 * Math.PI;
    const rot = ellipticAboutI(theta);
    const result = apply(rot, z);

    for (let k = -5; k <= 5; k++) {
      const otherTheta = theta + k * 2 * Math.PI;
      const otherRot = ellipticAboutI(otherTheta);
      const otherResult = apply(otherRot, z);

      expect(otherResult.re).toBeCloseTo(result.re);
      expect(otherResult.im).toBeCloseTo(result.im);
    }
  });

  it("Rotating preserves the distance between a point and i", () => {
    const z = randomUpperHalfPlanePoint();
    const distBefore = uhpDistance(I, z);
    const theta = Math.random() * 2 * Math.PI;
    const rot = ellipticAboutI(theta);
    const result = apply(rot, z);
    const distAfter = uhpDistance(I, result);

    expect(distBefore).toBeCloseTo(distAfter);
  });
});
