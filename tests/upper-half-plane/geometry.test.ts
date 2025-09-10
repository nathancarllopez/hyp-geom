import { describe, it, expect } from "vitest";
import { UhpGeometry } from "../../src/upper-half-plane/geometry.js";
import { getUhpPoints } from "../../src/upper-half-plane/points.js";
import { ComplexNumber } from "../../src/general-math/complex-numbers.js";

describe("Upper half plane geometry (upper-half-plane/geometry.ts)", () => {
  const rtol = 1e-5;
  const atol = 1e-8;
  const geom = new UhpGeometry(rtol, atol);
  const { factory, constants } = getUhpPoints(rtol, atol);

  describe("constructor", () => {
    it("throws error for negative tolerances in constructor", () => {
      expect(() => new UhpGeometry(-1, 1)).toThrow();
      expect(() => new UhpGeometry(1, -1)).toThrow();
    });

    it("sets and gets rtol and atol", () => {
      geom.rtol = 1e-4;
      geom.atol = 1e-7;
      expect(geom.rtol).toBeCloseTo(1e-4);
      expect(geom.atol).toBeCloseTo(1e-7);
      geom.rtol = 1e-5;
      geom.atol = 1e-8;
    });
  });

  describe("distance function", () => {
    it("distance returns Infinity for boundary points", () => {
      const z = factory(1, 0);
      const w = factory(2, 0);
      expect(geom.distance(z, w)).toBe(Infinity);
    });

    it("distance computes correct value for interior points", () => {
      const z = factory(1, 1);
      const w = factory(2, 1);
      const expected =
        2 * Math.asinh(z.eucDistance(w) / (2 * Math.sqrt(z.im * w.im)));
      expect(geom.distance(z, w)).toBeCloseTo(expected);
    });
  });

  describe("positionOnGeodesic", () => {
    it("positionOnGeodesic throws for vertical geodesic", () => {
      const z = factory(1, 1);
      const geod = geom.geodesicWithPointAtInfinity(z);
      expect(() => geom.positionOnGeodesic(z, geod)).toThrow();
    });
  });

  describe("tangentAtPointOnGeodesic", () => {
    it("tangentAtPointOnGeodesic returns correct direction for vertical geodesic", () => {
      const z = factory(1, 1);
      const w = factory(1, 2);
      const tangent = geom.tangentAtPointOnGeodesic(z, w);
      expect(tangent.re).toBe(0);
      expect(tangent.im).toBe(1);
    });
  });

  describe("angleFromThreePoints", () => {
    it("angleFromThreePoints returns 0 for infinity or equal points", () => {
      const p = factory(1, 1);
      const q = constants.INFINITY;
      const r = factory(1, 1);
      expect(geom.angleFromThreePoints(p, q, r)).toBe(0);
      expect(geom.angleFromThreePoints(p, p, r)).toBe(0);
    });
  });

  describe("getPointOnGeodesic", () => {
    it("getPointOnGeodesic returns correct point", () => {
      const pt = geom.getPointOnGeodesic(2, 1, Math.PI / 2);
      expect(pt.re).toBeCloseTo(1);
      expect(pt.im).toBeCloseTo(2);
    });
  });

  describe("geodesicWithPointAtInfinity", () => {
    it("geodesicWithPointAtInfinity returns vertical geodesic", () => {
      const z = factory(2, 1);
      const geod = geom.geodesicWithPointAtInfinity(z);
      expect(geod.isVertical).toBe(true);
      expect(geod.center.subType).toBe("infinity");
    });
  });

  describe("getGeodesicCenterAndRadius", () => {
    it("getGeodesicCenterAndRadius returns correct center and radius for same im", () => {
      const z = factory(1, 2);
      const w = factory(3, 2);
      const result = geom.getGeodesicCenterAndRadius(z, w);
      expect(result.center.im).toBe(0);
      expect(result.center.re).toBeCloseTo(2);
      expect(result.radius).toBeCloseTo(Math.hypot(z.re - 2, z.im));
    });
  });

  describe("geodesicConnectingFinitePoints", () => {
    it("geodesicConnectingFinitePoints throws for infinity", () => {
      const z = constants.INFINITY;
      const w = factory(1, 1);
      expect(() => geom.geodesicConnectingFinitePoints(z, w)).toThrow();
    });
  });

  describe("geodesicThroughPoints", () => {
    it("geodesicThroughPoints throws for equal points", () => {
      const z = factory(1, 1);
      expect(() => geom.geodesicThroughPoints(z, z)).toThrow();
    });
  });

  describe("geodesicFromBaseAndDirection", () => {
    it("geodesicFromBaseAndDirection throws for infinity direction", () => {
      const base = factory(1, 1);
      const dir = new ComplexNumber(Infinity, Infinity);
      expect(() => geom.geodesicFromBaseAndDirection(base, dir)).toThrow();
    });
  });

  describe("segmentBetweenPoints", () => {
    it("segmentBetweenPoints returns segment with correct length", () => {
      const z = factory(1, 1);
      const w = factory(2, 1);
      const seg = geom.segmentBetweenPoints(z, w);
      expect(seg.length).toBeCloseTo(geom.distance(z, w));
    });
  });

  describe("circleCenterAndRadius", () => {
    it("circleCenterAndRadius throws for non-positive radius", () => {
      const center = factory(1, 1);
      expect(() => geom.circleCenterAndRadius(center, 0)).toThrow();
    });

    it("circleCenterAndRadius returns correct eucCenter and eucRadius", () => {
      const center = factory(1, 1);
      const radius = 2;
      const circle = geom.circleCenterAndRadius(center, radius);
      expect(circle.eucCenter.re).toBeCloseTo(1);
      expect(circle.eucCenter.im).toBeCloseTo(Math.cosh(radius) * center.im);
      expect(circle.eucRadius).toBeCloseTo(Math.sinh(radius) * center.im);
    });
  });

  // Skip circleCenterAndBdryPoint because all it does is call this.distance to get a radius and then calls circleCenterAndRadius

  describe("horocyleGivenCenter", () => {
    it("horocyleGivenCenter returns correct horocycle for infinity", () => {
      const hor = geom.horocyleGivenCenter(constants.INFINITY);
      expect(hor.eucRadius).toBe(Infinity);
      expect(hor.basePoint.subType).toBe("infinity");
    });
  });

  describe("horocycleGivenBaseAndOnHor", () => {
    it("horocycleGivenBaseAndOnHor returns correct horocycle", () => {
      const base = factory(1, 0);
      const onHor = factory(2, 2);
      const hor = geom.horocycleGivenBaseAndOnHor(base, onHor);
      expect(hor.center.re).toBeCloseTo(1);
      expect(hor.center.im).toBeGreaterThan(0);
    });
  });

  // Skip polygonPerimeter and polygonArea because they are so simple the only way things could go wrong is in polygonFromVertices

  describe("polygonFromVertices", () => {
    it("polygonFromVertices returns correct polygon", () => {
      const v1 = factory(1, 1);
      const v2 = factory(2, 1);
      const v3 = factory(2, 2);
      const poly = geom.polygonFromVertices([v1, v2, v3]);
      expect(poly.vertices.length).toBe(3);
      expect(poly.sides.length).toBe(3);
      expect(poly.angles.length).toBe(3);
      expect(poly.area).toBeCloseTo(geom.polygonArea(poly.angles));
      expect(poly.perimeter).toBeCloseTo(geom.polygonPerimeter(poly.sides));
    });
  });
});
