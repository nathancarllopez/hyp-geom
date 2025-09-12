import { describe, it, expect } from "vitest";
import { UhpGeometry } from "../../src/upper-half-plane/geometry.js";
import { getUhpPoints } from "../../src/upper-half-plane/points.js";
import { ComplexNumber } from "../../src/general-math/complex-numbers.js";
import { randomReal, randomUhpPoint } from "../helpers/random.js";

describe("Upper half plane geometry (upper-half-plane/geometry.ts)", () => {
  const geom = new UhpGeometry();
  const { factory, constants } = getUhpPoints();
  const { I, ONE, NEGONE, INFINITY } = constants;

  describe("constructor", () => {
    it("throws error for negative tolerances in constructor", () => {
      expect(() => new UhpGeometry(-1, 1)).toThrow();
      expect(() => new UhpGeometry(1, -1)).toThrow();
    });

    it("sets and gets rtol and atol", () => {
      const geom = new UhpGeometry();

      for (let i = 0; i < 10; i++) {
        const rtol = randomReal(1, true);
        const atol = randomReal(1, true);

        geom.rtol = rtol;
        geom.atol = atol;

        expect(geom.rtol).toBeCloseTo(rtol);
        expect(geom.atol).toBeCloseTo(atol);
      }
    });
  });

  describe("distance function", () => {
    it("returns 1 for the distance between i and e*i", () => {
      const w = factory(0, Math.E);
      expect(geom.distance(I, w)).toBeCloseTo(1);
    });

    it("returns ln(b) for the distance between i and b*i", () => {
      for (let i = 0; i < 10; i++) {
        const im = randomReal(undefined, true);
        const z = factory(0, im);
        expect(geom.distance(I, z)).toBeCloseTo(Math.log(im));
      }
    });

    it("returns Infinity for boundary points", () => {
      for (let i = 0; i < 10; i++) {
        const z = randomUhpPoint();
        const bdry = randomUhpPoint("boundary");
        expect(geom.distance(z, bdry)).toBe(Infinity);
      }
    });

    it("is the same if the order of the inputs switches", () => {
      for (let i = 0; i < 10; i++) {
        const z = randomUhpPoint();
        const w = randomUhpPoint();
        expect(geom.distance(z, w)).toBeCloseTo(geom.distance(w, z));
      }
    });
  });

  describe("positionOnGeodesic", () => {
    it("throws for vertical geodesic", () => {
      const z = factory(1, 1);
      const geod = geom.geodesicWithPointAtInfinity(z);
      expect(() => geom.positionOnGeodesic(z, geod)).toThrow();
    });

    it("throws if the given point is not on the geodesic", () => {
      const z = factory(1, 1);
      const geod = geom.geodesicThroughPoints(factory(2, 2), factory(3, 3));
      expect(() => geom.positionOnGeodesic(z, geod)).toThrow();
    });

    it("returns pi / 2 for i on the geodesic with endpoints 1 and -1", () => {
      const geod = geom.geodesicThroughPoints(ONE, NEGONE);
      const pos = geom.positionOnGeodesic(I, geod);
      expect(pos).toBeCloseTo(Math.PI / 2);
    });
  });

  describe("tangentAtPointOnGeodesic", () => {
    it("tangentAtPointOnGeodesic returns correct direction for vertical geodesic", () => {
      const z = factory(1, 1);
      const w = factory(1, 2);
      const tangent = geom.tangentAtPointOnGeodesic(z, w);

      expect(tangent.isEqualTo(I)).toBe(true);
    });

    it("returns correct direction for downward vertical geodesic", () => {
      const z = factory(1, 2);
      const w = factory(1, 1);
      const tangent = geom.tangentAtPointOnGeodesic(z, w);
      expect(tangent.re).toBe(0);
      expect(tangent.im).toBe(-1);
    });

    it("returns correct tangent for non-vertical geodesic (right)", () => {
      const tangent = geom.tangentAtPointOnGeodesic(I, ONE);
      
      expect(tangent.isEqualTo(ONE)).toBe(true);
    });

    it("returns correct tangent for non-vertical geodesic (left)", () => {
      const tangent = geom.tangentAtPointOnGeodesic(I, NEGONE);
      
      expect(tangent.isEqualTo(NEGONE)).toBe(true);
    });

    it("returns equal but opposite tangent if the direction point is on different sides of the base", () => {
      for (let i = 0; i < 10; i++) {
        const real = randomReal();
        const disp = randomReal();
        const ePoint1 = factory(real, 0);
        const ePoint2 = factory(real + disp, 0);
        
        const { center, radius } = geom.geodesicThroughPoints(ePoint1, ePoint2);
        const theta = randomReal(Math.PI, true);
        const basePoint = factory(radius * Math.cos(theta) + center.re, radius * Math.sin(theta));
        
        const tangent1 = geom.tangentAtPointOnGeodesic(basePoint, ePoint1);
        const tangent2 = geom.tangentAtPointOnGeodesic(basePoint, ePoint2);

        expect(tangent1.isEqualTo(tangent2.scale(-1))).toBe(true);
      }
    })

    it("throws if basePoint and dirPoint are equal", () => {
      const z = factory(1, 1);
      expect(() => geom.tangentAtPointOnGeodesic(z, z)).toThrow();
    });
  });

  describe("angleFromThreePoints", () => {
    it("returns valid angle for random valid points", () => {
      let counter = 0;

      while (counter < 10) {
        const p = randomUhpPoint("interior");
        const q = randomUhpPoint("interior");
        const r = randomUhpPoint("interior");
        if (!q.isEqualTo(r) && q.subType !== "infinity") {
          counter++;
          const angle = geom.angleFromThreePoints(p, q, r);
          expect(angle).toBeGreaterThanOrEqual(0);
          expect(angle).toBeLessThanOrEqual(Math.PI);
        }
      }
    });

    it("angleFromThreePoints returns 0 for infinity or equal points", () => {
      for (let i = 0; i < 10; i++) {
        const p = randomUhpPoint();
        const r = randomUhpPoint();

        expect(geom.angleFromThreePoints(p, INFINITY, r)).toBe(0);
        expect(geom.angleFromThreePoints(p, r, p)).toBe(0);
      }
    });

    it("returns pi/2 for three points forming a right angle at the middle", () => {
      const twoI = factory(0, 2);
      const right = geom.angleFromThreePoints(ONE, I, twoI);
      expect(right).toBeCloseTo(Math.PI / 2);
    });

    it("returns pi for three collinear points on a vertical geodesic", () => {
      const p = factory(1, 1);
      const q = factory(1, 2);
      const r = factory(1, 3);
      const angle = geom.angleFromThreePoints(p, q, r);
      expect(angle).toBeCloseTo(Math.PI);
    });

    it("returns pi for three collinear points on an arbitrary geodesic", () => {
      for (let i = 0; i < 10; i++) {
        const real = randomReal();
        const disp = randomReal();
        const ePoint1 = factory(real, 0);
        const ePoint2 = factory(real + disp, 0);
        const { center, radius } = geom.geodesicThroughPoints(ePoint1, ePoint2);
        
        const theta = randomReal(Math.PI, true);
        const q = factory(radius * Math.cos(theta) + center.re, radius * Math.sin(theta));
        const angle = geom.angleFromThreePoints(ePoint1, q, ePoint2);

        expect(angle).toBeCloseTo(Math.PI);
      }
    });

    it("returns the same angle when the order of the points is reversed", () => {
      let counter = 0;

      while (counter < 10) {
        const p = randomUhpPoint("interior");
        const q = randomUhpPoint("interior");
        const r = randomUhpPoint("interior");

        if (!q.isEqualTo(r) && q.subType !== "infinity") {
          counter++
          const angle1 = geom.angleFromThreePoints(p, q, r);
          const angle2 = geom.angleFromThreePoints(r, q, p);
          expect(angle1).toBeCloseTo(angle2);
        }
      }
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
