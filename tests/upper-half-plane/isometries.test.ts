import { describe, it } from "vitest";

describe("Class constructor", () => {
  it("Accepts valid inputs", () => {})
});

// import { describe, expect, it } from "vitest";
// import {
//   I,
//   toUhpPoint,
//   uhpDistance,
// } from "../../src/upper-half-plane/geometry";
// import {
//   ellipticAboutI,
//   apply,
//   elliptic,
// } from "../../src/upper-half-plane/isometries";
// import { randomUhpInteriorPoint } from "../helpers/random";

// describe("Elliptic about i, i.e., rotations about i", () => {
//   it("Rotating by pi sends e*i to (1 / e)*i", () => {
//     const z = toUhpPoint(0, Math.E);
//     const halfRot = ellipticAboutI(Math.PI);
//     const result = apply(halfRot, z);

//     expect(result.re).toBeCloseTo(0);
//     expect(result.im).toBeCloseTo(1 / Math.E);
//   });

//   it("Rotating by 0 leaves the point unchanged", () => {
//     const z = randomUhpInteriorPoint();
//     const rot = ellipticAboutI(0);
//     const result = apply(rot, z);

//     expect(result.re).toBeCloseTo(z.re);
//     expect(result.im).toBeCloseTo(z.im);
//   });

//   it("Rotating by 2*pi leaves the point unchanged", () => {
//     const z = randomUhpInteriorPoint();
//     const rot = ellipticAboutI(2 * Math.PI);
//     const result = apply(rot, z);

//     expect(result.re).toBeCloseTo(z.re);
//     expect(result.im).toBeCloseTo(z.im);
//   });

//   it("Rotations that differ by a multiple of 2*pi are identical", () => {
//     const z = randomUhpInteriorPoint();
//     const theta = Math.random() * 2 * Math.PI;
//     const rot = ellipticAboutI(theta);
//     const result = apply(rot, z);

//     for (let k = -5; k <= 5; k++) {
//       const otherTheta = theta + k * 2 * Math.PI;
//       const otherRot = ellipticAboutI(otherTheta);
//       const otherResult = apply(otherRot, z);

//       expect(otherResult.re).toBeCloseTo(result.re);
//       expect(otherResult.im).toBeCloseTo(result.im);
//     }
//   });

//   it("Rotating preserves the distance between a point and i", () => {
//     const z = randomUhpInteriorPoint();
//     const distBefore = uhpDistance(I, z);
//     const theta = Math.random() * 2 * Math.PI;
//     const rot = ellipticAboutI(theta);
//     const result = apply(rot, z);
//     const distAfter = uhpDistance(I, result);

//     expect(distBefore).toBeCloseTo(distAfter);
//   });
// });

// describe("Elliptic isometry, i.e., rotations around a point", () => {
//   it("Rotating by pi about z = a + i*b sends u = a + i*(b*e) to v = a + i*(b/e)", () => {
//     const center = randomUhpInteriorPoint();
//     const u = toUhpPoint(center.re, center.im * Math.E);
//     const v = toUhpPoint(center.re, center.im / Math.E);

//     const halfRot = elliptic(center.re, center.im, Math.PI);
//     const result = apply(halfRot, u);

//     expect(result.re).toBeCloseTo(v.re);
//     expect(result.im).toBeCloseTo(v.im);
//   });

//   it("Rotating by 0 leaves the point unchanged", () => {
//     const center = randomUhpInteriorPoint();
//     const z = randomUhpInteriorPoint();
//     const rot = elliptic(center.re, center.im, 0);
//     const result = apply(rot, z);

//     expect(result.re).toBeCloseTo(z.re);
//     expect(result.im).toBeCloseTo(z.im);
//   });

//   it("Rotating by 2*pi leaves the point unchanged", () => {
//     const center = randomUhpInteriorPoint();
//     const z = randomUhpInteriorPoint();
//     const rot = elliptic(center.re, center.im, 2 * Math.PI);
//     const result = apply(rot, z);

//     expect(result.re).toBeCloseTo(z.re);
//     expect(result.im).toBeCloseTo(z.im);
//   });

//   it("Rotations that differ by a multiple of 2*pi are identical", () => {
//     const center = randomUhpInteriorPoint();
//     const z = randomUhpInteriorPoint();
//     const theta = Math.random() * 2 * Math.PI;
//     const rot = elliptic(center.re, center.im, theta);
//     const result = apply(rot, z);

//     for (let k = -5; k <= 5; k++) {
//       const otherTheta = theta + k * 2 * Math.PI;
//       const otherRot = elliptic(center.re, center.im, otherTheta);
//       const otherResult = apply(otherRot, z);

//       expect(otherResult.re).toBeCloseTo(result.re);
//       expect(otherResult.im).toBeCloseTo(result.im);
//     }
//   });

//   it("Rotating preserves the distance between a point and i", () => {
//     const center = randomUhpInteriorPoint();
//     const z = randomUhpInteriorPoint();
//     const distBefore = uhpDistance(center, z);

//     const theta = Math.random() * 2 * Math.PI;
//     const rot = elliptic(center.re, center.im, theta);
//     const result = apply(rot, z);
//     const distAfter = uhpDistance(center, result);

//     expect(distBefore).toBeCloseTo(distAfter);
//   });
// });
