import { describe } from "node:test";
import { getUhpPoints, UhpPoint } from "../../src/upper-half-plane/points.js";
import { it, expect } from "vitest";
import { randomReal } from "../helpers/random.js";

describe("Upper Half Plane points (points.ts)", () => {
  describe("getUhpPoints function", () => {
    it("returns constants and factory", () => {
      const { constants, factory } = getUhpPoints();
      expect(constants).toBeTypeOf("object");
      expect(factory).toBeTypeOf("function");
    });

    it("constants have correct types and values", () => {
      const { constants } = getUhpPoints();
      
      Object.values(constants).forEach((val) => expect(val instanceof UhpPoint));
      
      expect(constants.ZERO.re).toBe(0);
      expect(constants.ZERO.im).toBe(0);
      expect(constants.ZERO.type).toBe("boundary");
      expect(constants.ZERO.subType).toBe("on-real-line");

      expect(constants.ONE.re).toBe(1);
      expect(constants.ONE.im).toBe(0);
      expect(constants.ONE.type).toBe("boundary");
      expect(constants.ONE.subType).toBe("on-real-line");

      expect(constants.I.re).toBe(0);
      expect(constants.I.im).toBe(1);
      expect(constants.I.type).toBe("interior");
      expect(constants.I.subType).toBeUndefined();

      expect(constants.NEGONE.re).toBe(-1);
      expect(constants.NEGONE.im).toBe(0);
      expect(constants.NEGONE.type).toBe("boundary");
      expect(constants.NEGONE.subType).toBe("on-real-line");

      expect(constants.INFINITY.re).toBe(Infinity);
      expect(constants.INFINITY.im).toBe(Infinity);
      expect(constants.INFINITY.type).toBe("boundary");
      expect(constants.INFINITY.subType).toBe("infinity");
    });

    it("factory creates UhpPoint with correct values", () => {
      const { factory } = getUhpPoints();
      const pt = factory(2, 3);
      expect(pt).toBeInstanceOf(UhpPoint);
      expect(pt.re).toBe(2);
      expect(pt.im).toBe(3);
      expect(pt.type).toBe("interior");
    });

    it("throws error for non-positive tolerances", () => {
      expect(() => getUhpPoints(0, 1e-8)).toThrow("Tolerances must be positive");
      expect(() => getUhpPoints(1e-5, -1)).toThrow("Tolerances must be positive");
    });
  });

  describe("UhpPoint constructor", () => {
    it("should return an instance of the UhpPoint class", () => {
      const pt = new UhpPoint(1, 2);
      expect(pt).toBeInstanceOf(UhpPoint);
      expect(pt.re).toBe(1);
      expect(pt.im).toBe(2);
      expect(pt.type).toBe("interior");
    });

    it("should throw when imaginary part is negative", () => {
      expect(() => new UhpPoint(1, -1)).toThrow("Imaginary part cannot be negative");
      expect(() => new UhpPoint(0, -0.0001)).toThrow("Imaginary part cannot be negative");
    });

    it("should classify types and subtypes of points correctly", () => {
      const interior = new UhpPoint(0, 1);
      expect(interior.type).toBe("interior");
      expect(interior.subType).toBeUndefined();

      const boundaryReal = new UhpPoint(2, 0);
      expect(boundaryReal.type).toBe("boundary");
      expect(boundaryReal.subType).toBe("on-real-line");

      const boundaryInfinity = new UhpPoint(Infinity, Infinity);
      expect(boundaryInfinity.type).toBe("boundary");
      expect(boundaryInfinity.subType).toBe("infinity");

      for (let i = 0; i < 10; i++) {
        const re = randomReal();
        if (i % 2 === 0) {
          const pt = new UhpPoint(re, 0);
          expect(pt.type).toBe("boundary");
          expect(pt.subType).toBe("on-real-line");
        } else {
          const im = randomReal(undefined, true);
          const pt = new UhpPoint(re, im);
          expect(pt.type).toBe("interior");
          expect(pt.subType).toBeUndefined();
        }
      }
    });

    it("should throw when tolerances are not positive", () => {
      expect(() => getUhpPoints(0, 1e-8)).toThrow("Tolerances must be positive");
      expect(() => getUhpPoints(1e-5, -1)).toThrow("Tolerances must be positive");
    });
  });
});