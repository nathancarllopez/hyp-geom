import { describe, it, expect } from "vitest";
import { moveGeodesicToImAxis, movePointToI, movePointToInfinity } from "../../src/upper-half-plane/conjugations.js";

describe("conjugations", () => {
  // Mock classes and helpers
  class MockUhpPoint {
    constructor(public re: number, public im: number, public type = "interior", public subType = "") {}
    scale(factor: number) {
      return new MockUhpPoint(this.re * factor, this.im * factor, this.type, this.subType);
    }
  }
  class MockComplexNumber {
    constructor(public re: number, public im: number) {}
  }
  class MockUhpIsometry {
    constructor(public points: any[], public rtol: number, public atol: number) {}
  }
  // Patch imports for testing
  const factory = (re: number, im: number) => new MockUhpPoint(re, im);
  const identityIsometry = new MockUhpIsometry([], 1e-10, 1e-10);

  describe("moveGeodesicToImAxis", () => {
    it("returns an isometry for two points", () => {
      const z = new MockUhpPoint(1, 2);
      const w = new MockUhpPoint(3, 4);
      // Patch UhpGeometry and UhpIsometry for test
      // @ts-ignore
      const result = moveGeodesicToImAxis(z, w, factory, 1e-10, 1e-10);
      expect(result).toBeInstanceOf(Object);
      expect(result.points.length).toBe(4);
    });

    it("returns an isometry for base and direction", () => {
      const base = new MockUhpPoint(1, 2);
      const direction = new MockComplexNumber(0, 1);
      // @ts-ignore
      const result = moveGeodesicToImAxis(base, direction, factory, 1e-10, 1e-10);
      expect(result).toBeInstanceOf(Object);
      expect(result.points.length).toBe(4);
    });
  });

  describe("movePointToI", () => {
    it("returns an isometry for an interior point", () => {
      const z = new MockUhpPoint(2, 3, "interior");
      // @ts-ignore
      const result = movePointToI(z, factory, 1e-10, 1e-10);
      expect(result).toBeInstanceOf(Object);
      expect(result.points.length).toBe(4);
    });

    it("throws for non-interior point", () => {
      const z = new MockUhpPoint(2, 3, "boundary");
      expect(() => {
        // @ts-ignore
        movePointToI(z, factory, 1e-10, 1e-10);
      }).toThrow("Only interior points can be moved to I");
    });
  });

  describe("movePointToInfinity", () => {
    it("returns identity for infinity subtype", () => {
      const z = new MockUhpPoint(0, 0, "interior", "infinity");
      // @ts-ignore
      const result = movePointToInfinity(z, identityIsometry, factory, 1e-10, 1e-10);
      expect(result).toBe(identityIsometry);
    });

    it("returns an isometry for non-infinity point", () => {
      const z = new MockUhpPoint(1, 2, "interior");
      // @ts-ignore
      const result = movePointToInfinity(z, identityIsometry, factory, 1e-10, 1e-10);
      expect(result).toBeInstanceOf(Object);
      expect(result.points.length).toBe(4);
    });
  });
});
