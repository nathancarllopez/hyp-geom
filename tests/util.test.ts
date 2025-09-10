import { describe, expect, it } from "vitest";
import { randomReal } from "./helpers/random.js";
import {
  isPositiveNumber,
  isPointArray,
  nearlyEqual,
  anglesEquivalent,
} from "../src/util.js";

describe("Utility functions", () => {
  describe("isPositiveNumber", () => {
    it("validates that a given input is a number and postive", () => {
      expect(isPositiveNumber(5)).toBe(true);
    });

    it("works for random number inputs", () => {
      for (let i = 0; i < 10; i++) {
        const randomPositive = randomReal();
        expect(isPositiveNumber(randomPositive)).toBe(randomPositive > 0);
      }
    });

    it("returns false if given input is not a number or is not positive", () => {
      expect(isPositiveNumber(-3)).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
      expect(isPositiveNumber({ foo: "bar" })).toBe(false);
      expect(isPositiveNumber([1, 2, 3])).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber(undefined)).toBe(false);
    });
  });

  describe("isPointArray", () => {
    it("validates that a given input is the type [number, number]", () => {
      expect(isPointArray([1, 2])).toBe(true);
      expect(isPointArray([0, -5.5])).toBe(true);
    });

    it("returns false if the input is not an array, not length 2, or either of the inputs is not a number", () => {
      expect(isPointArray([1])).toBe(false);
      expect(isPointArray([1, 2, 3])).toBe(false);
      expect(isPointArray(["1", 2])).toBe(false);
      expect(isPointArray([1, "2"])).toBe(false);
      expect(isPointArray("not an array")).toBe(false);
      expect(isPointArray({ x: 1, y: 2 })).toBe(false);
      expect(isPointArray(null)).toBe(false);
      expect(isPointArray(undefined)).toBe(false);
    });
  });

  describe("nearlyEqual", () => {
    it("returns true when inputs are exactly equal", () => {
      expect(nearlyEqual(5, 5)).toBe(true);
    });

    it("returns true when inputs are exactly equal for any absolute and relative tolerances", () => {
      for (let i = 0; i < 10; i++) {
        const num = randomReal();
        const rtol = randomReal(10, true);
        const atol = randomReal(10, true);

        expect(nearlyEqual(num, num, rtol, atol));
      }
    });

    it("returns true when inputs are close together (with respect to the tolerances)", () => {
      expect(nearlyEqual(1.000001, 1.000002, 1e-5, 1e-8)).toBe(true);
      expect(nearlyEqual(1000, 1000.00001, 1e-5, 1e-8)).toBe(true);
    });

    it("returns false when inputs are not close together (with respect to the tolerances)", () => {
      expect(nearlyEqual(1, 2, 1e-8, 1e-8)).toBe(false);
      expect(nearlyEqual(100, 101, 1e-8, 1e-8)).toBe(false);
    });

    it("works for very large numbers", () => {
      expect(nearlyEqual(1e10, 1e10 + 1, 1e-5, 1e-8)).toBe(true);
      expect(nearlyEqual(1e10, 1e10 + 1e6, 1e-5, 1e-8)).toBe(false);
    });

    it("works for very small numbers", () => {
      expect(nearlyEqual(1e-10, 2e-10, 1e-5, 1e-8)).toBe(true);
      expect(nearlyEqual(1e-10, 1e-8, 1e-10, 1e-10)).toBe(false);
    });

    it("works for infinite inputs, i.e., returns true if both inputs are infinite and false if only one of the inputs are infinite", () => {
      expect(nearlyEqual(Infinity, Infinity)).toBe(true);
      expect(nearlyEqual(-Infinity, -Infinity)).toBe(true);
      expect(nearlyEqual(Infinity, -Infinity)).toBe(false);
      expect(nearlyEqual(Infinity, 1e10)).toBe(false);
      expect(nearlyEqual(-Infinity, 0)).toBe(false);
    });

    it("throws if either tolerance is zero or negative", () => {
      expect(() => nearlyEqual(1, 1, 0, 1e-8)).toThrow();
      expect(() => nearlyEqual(1, 1, 1e-8, 0)).toThrow();
      expect(() => nearlyEqual(1, 1, -1e-8, 1e-8)).toThrow();
      expect(() => nearlyEqual(1, 1, 1e-8, -1e-8)).toThrow();
    });
  });

  describe("anglesEquivalent", () => {
    it("returns true when inputs are exactly equal", () => {
      expect(anglesEquivalent(2.5, 2.5)).toBe(true);
    });

    it("returns true when inputs are exactly equal for any absolute tolerance", () => {
      for (let i = 0; i < 10; i++) {
        const num = randomReal();
        const atol = randomReal(10, true);

        expect(anglesEquivalent(num, num, atol));
      }
    });

    it("returns true when inputs are close together (with respect to the absolute tolerance)", () => {
      expect(anglesEquivalent(1.000001, 1.000002, 1e-5)).toBe(true);
      expect(anglesEquivalent(-2.5, -2.50000001, 1e-7)).toBe(true);
    });

    it("returns true when inputs are not the same but their difference is a multiple of 2pi", () => {
      expect(anglesEquivalent(2 * Math.PI, 0)).toBe(true);
      expect(anglesEquivalent(0, 2 * Math.PI)).toBe(true);
      expect(anglesEquivalent(Math.PI, Math.PI + 2 * Math.PI)).toBe(true);
      expect(anglesEquivalent(-Math.PI, -Math.PI + 2 * Math.PI)).toBe(true);
      expect(anglesEquivalent(1, 1 + 2 * Math.PI)).toBe(true);
    });

    it("returns false when inputs differ by pi", () => {
      expect(anglesEquivalent(0, Math.PI)).toBe(false);
      expect(anglesEquivalent(1, 1 + Math.PI)).toBe(false);
    });

    it("works for very large numbers", () => {
      const a = 1e8;
      const b = a + 2 * Math.PI;
      expect(anglesEquivalent(a, b)).toBe(true);
      expect(anglesEquivalent(a, a + Math.PI)).toBe(false);
    });

    it("works for very small numbers", () => {
      expect(anglesEquivalent(1e-10, 2e-10, 1e-9)).toBe(true);
      expect(anglesEquivalent(1e-10, 1e-8, 1e-11)).toBe(false);
    });

    it("throws if either angle is infinite", () => {
      expect(() => anglesEquivalent(Infinity, 0)).toThrow();
      expect(() => anglesEquivalent(0, Infinity)).toThrow();
      expect(() => anglesEquivalent(-Infinity, 0)).toThrow();
      expect(() => anglesEquivalent(0, -Infinity)).toThrow();
    });

    it("throws if absolute tolerance is zero or negative", () => {
      expect(() => anglesEquivalent(0, 0, 0)).toThrow();
      expect(() => anglesEquivalent(0, 0, -1e-8)).toThrow();
    });
  });
});
