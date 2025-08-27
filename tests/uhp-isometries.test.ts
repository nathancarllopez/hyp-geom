import { describe, expect, it } from "vitest";
import { hypDistance, I, upperHalfPlane } from "../src/upper-half-plane";
import { rotateAboutI, apply } from "../src/uhp-isometries";
import { randomUpperHalfPlanePoint } from "./helpers/random";

describe("Rotations about i", () => {
  it("Rotating by pi sends e*i to (1 / e)*i", () => {
    const z = upperHalfPlane(0, Math.E);
    const halfRot = rotateAboutI(Math.PI);
    const result = apply(halfRot, z);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(1 / Math.E);
  });

  it("Rotating by 0 leaves the point unchanged", () => {
    const z = randomUpperHalfPlanePoint();
    const rot = rotateAboutI(0);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotating by 2*pi leaves the point unchanged", () => {
    const z = randomUpperHalfPlanePoint();
    const rot = rotateAboutI(2 * Math.PI);
    const result = apply(rot, z);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("Rotating preserves the distance between a point and i", () => {
    const z = randomUpperHalfPlanePoint();
    const distBefore = hypDistance(I, z);
    const theta = Math.random() * 2 * Math.PI;
    const rot = rotateAboutI(theta);
    const result = apply(rot, z);
    const distAfter = hypDistance(I, result);

    expect(distBefore).toBeCloseTo(distAfter);
  })
})