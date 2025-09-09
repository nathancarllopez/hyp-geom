// import { describe, expect, it } from "vitest";
// import { UhpGeometry } from "../src";
// import {
//   randomComplex,
//   randomUhpBoundaryPoint,
//   randomUhpInteriorPoint,
// } from "./helpers/random";
// import {
//   circleCenterAndBdryPoint,
//   circleCenterAndRadius,
//   geodesicThroughPoints,
//   geodesicFromBaseAndDirection,
//   horocycleGivenBaseAndOnHor,
//   horocyleGivenCenter,
//   toPointAtInfinity,
//   toUhpBoundaryPoint,
//   uhpDistance,
// } from "../src/upper-half-plane/geometry";

// describe("UhpGeometry class", () => {
//   const uhp = new UhpGeometry();

//   it("distance between two points", () => {
//     const z = randomUhpInteriorPoint();
//     const w = randomUhpInteriorPoint();
//     const dist = uhpDistance(z, w);

//     const result = uhp.distance(z.re, z.im, w.re, w.im);

//     expect(result).toBe(dist);
//   });

//   it("distance returns Infinity for points on the real axis or at infinity", () => {
//     // imZ = 0 (on real axis)
//     expect(uhp.distance(1, 0, 2, 1)).toBe(Infinity);

//     // imW = 0 (on real axis)
//     expect(uhp.distance(1, 1, 2, 0)).toBe(Infinity);

//     // reZ = Infinity
//     expect(uhp.distance(Infinity, 1, 2, 1)).toBe(Infinity);

//     // reW = -Infinity
//     expect(uhp.distance(1, 1, -Infinity, 2)).toBe(Infinity);

//     // imZ = Infinity
//     expect(uhp.distance(1, Infinity, 2, 1)).toBe(Infinity);

//     // imW = Infinity
//     expect(uhp.distance(1, 1, 2, Infinity)).toBe(Infinity);
//   });

//   it("geodesic between two points", () => {
//     const z = randomUhpInteriorPoint();
//     const w = randomUhpInteriorPoint();
//     const geodesic = geodesicThroughPoints(z, w);

//     const result = uhp.geodesic({ reZ: z.re, imZ: z.im, reW: w.re, imW: w.im });

//     expect(result).toEqual(geodesic);
//   });

//   it("geodesic given a base point and a direction", () => {
//     const base = randomUhpInteriorPoint();
//     const direction = randomComplex();
//     const geodesic = geodesicFromBaseAndDirection(base, direction);

//     const result = uhp.geodesic({
//       reBase: base.re,
//       imBase: base.im,
//       dirX: direction.re,
//       dirY: direction.im,
//     });

//     expect(result).toEqual(geodesic);
//   });

//   it("circle from center and radius", () => {
//     const center = randomUhpInteriorPoint();
//     const radius = 1e2 * Math.random();
//     const circle = circleCenterAndRadius(center, radius);

//     const uhp = new UhpGeometry();
//     const result = uhp.circle({
//       reCenter: center.re,
//       imCenter: center.im,
//       radius,
//     });

//     expect(result).toEqual(circle);
//   });

//   it("circle from center and bdry point", () => {
//     const center = randomUhpInteriorPoint();
//     const bdryPoint = randomUhpInteriorPoint();
//     const circle = circleCenterAndBdryPoint(center, bdryPoint);

//     const uhp = new UhpGeometry();
//     const result = uhp.circle({
//       reCenter: center.re,
//       imCenter: center.im,
//       reBdryPoint: bdryPoint.re,
//       imBdryPoint: bdryPoint.im,
//     });

//     expect(result).toEqual(circle);
//   });

//   it("horocycle from finite center", () => {
//     const center = randomUhpInteriorPoint();
//     const uhp = new UhpGeometry();

//     const result = uhp.horocycle({
//       reCenter: center.re,
//       imCenter: center.im,
//     });

//     // Should match the direct construction
//     expect(result).toEqual(horocyleGivenCenter(center));
//   });

//   it("horocycle from center at infinity", () => {
//     const uhp = new UhpGeometry();

//     const result = uhp.horocycle({
//       reCenter: Infinity,
//       imCenter: Infinity,
//     });

//     const center = toPointAtInfinity(Infinity, Infinity);
//     expect(result).toEqual(horocyleGivenCenter(center));
//   });

//   it("horocycle from base point and horocycle point (finite base)", () => {
//     const base = randomUhpBoundaryPoint();
//     const horPoint = randomUhpInteriorPoint();
//     const uhp = new UhpGeometry();

//     const result = uhp.horocycle({
//       reBasePoint: base.re,
//       imBasePoint: base.im,
//       reHorPoint: horPoint.re,
//       imHorPoint: horPoint.im,
//     });

//     const basePoint = toUhpBoundaryPoint(base.re, base.im);
//     expect(result).toEqual(horocycleGivenBaseAndOnHor(basePoint, horPoint));
//   });

//   it("horocycle from base point at infinity", () => {
//     const horPoint = randomUhpInteriorPoint();
//     const uhp = new UhpGeometry();

//     const result = uhp.horocycle({
//       reBasePoint: Infinity,
//       imBasePoint: Infinity,
//       reHorPoint: horPoint.re,
//       imHorPoint: horPoint.im,
//     });

//     const basePoint = toPointAtInfinity(Infinity, Infinity);
//     expect(result).toEqual(horocycleGivenBaseAndOnHor(basePoint, horPoint));
//   });

//   it("isometry constructs UhpIsometry from complex coefficients", () => {
//     const uhp = new UhpGeometry();
//     // 2x2 matrix: [[1+i, 2], [3, 4-i]]
//     const coeffs = [
//       { re: 1, im: 1 },
//       { re: 2, im: 0 },
//       { re: 3, im: 0 },
//       { re: 4, im: -1 },
//     ];
//     const result = uhp.isometry(coeffs);
//     // Should be an instance of UhpIsometry
//     expect(result).toBeInstanceOf(Object);
//     expect(result.constructor.name).toBe("UhpIsometry");
//   });

//   it("elliptic returns a rotation isometry about a given center", () => {
//     const uhp = new UhpGeometry();
//     const center = randomUhpInteriorPoint();
//     const theta = Math.PI / 3;
//     const result = uhp.elliptic(center.re, center.im, theta);
//     expect(result).toBeInstanceOf(Object);
//     expect(result.constructor.name).toBe("UhpIsometry");
//     // Should have a conjugate method (as in the implementation)
//     expect(typeof result.conjugate).toBe("function");
//   });
// });
