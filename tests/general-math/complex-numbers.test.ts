import { describe, it, expect } from "vitest";
import { ComplexNumber, getComplexNumbers } from "../../src/general-math/complex-numbers.js";
import { randomReal } from "../helpers/random.js";

describe("getComplexNumbers factory function", () => {
  it("returns a set of complex numbers and a factory function for other complex numbers", () => {
    for (let i = 0; i < 5; i++) {
      const tolerance = randomReal(1, true);
      const { constants, factory } = getComplexNumbers(tolerance);

      expect(typeof constants).toBe("object");

      for (const complex of Object.values(constants)) {
        expect(complex instanceof ComplexNumber).toBeTruthy();
      }

      for (let i = 0; i < 10; i++) {
        const re = randomReal();
        const im = randomReal();
        const complex = factory(re, im);

        expect(complex instanceof ComplexNumber).toBeTruthy();
      }
    }
  });

  it("throws an error if tolerance is not positive", () => {
    expect(() => getComplexNumbers(0)).toThrow("The tolerance must be a positive number");
    expect(() => getComplexNumbers(-1)).toThrow("The tolerance must be a positive number");
    expect(() => getComplexNumbers(NaN)).toThrow("The tolerance must be a positive number");
  });

  it("constants have correct values", () => {
    const { constants } = getComplexNumbers(1e-4);
    expect(constants.ZERO.re).toBe(0);
    expect(constants.ZERO.im).toBe(0);
    expect(constants.ONE.re).toBe(1);
    expect(constants.ONE.im).toBe(0);
    expect(constants.NEGONE.re).toBe(-1);
    expect(constants.NEGONE.im).toBe(0);
    expect(constants.I.re).toBe(0);
    expect(constants.I.im).toBe(1);
    expect(constants.NEGI.re).toBe(0);
    expect(constants.NEGI.im).toBe(-1);
    expect(constants.INFINITY.re).toBe(Infinity);
    expect(constants.INFINITY.im).toBe(Infinity);
  });

  it("factory creates complex numbers with correct tolerance", () => {
    const tolerance = 1e-6;
    const { factory } = getComplexNumbers(tolerance);
    const c = factory(2, 3);
    expect(c.re).toBe(2);
    expect(c.im).toBe(3);
    expect(c.tolerance).toBe(tolerance);
  });

  it("constants use the provided tolerance", () => {
    const tolerance = 1e-7;
    const { constants } = getComplexNumbers(tolerance);
    expect(constants.ZERO.tolerance).toBe(tolerance);
    expect(constants.ONE.tolerance).toBe(tolerance);
    expect(constants.INFINITY.tolerance).toBe(tolerance);
  });
});

describe("ComplexNumber class", () => {
  describe("constructor", () => {
    it("creates a complex number with given real and imaginary parts", () => {
      const c = new ComplexNumber(2, 3, 1e-5);
      expect(c.re).toBe(2);
      expect(c.im).toBe(3);
      expect(c.tolerance).toBe(1e-5);
    });

    it("defaults tolerance to 1e-4 if not provided", () => {
      const c = new ComplexNumber(1, 1);
      expect(c.tolerance).toBe(1e-4);
    });

    it("throws if tolerance is not positive", () => {
      expect(() => new ComplexNumber(1, 1, 0)).toThrow();
      expect(() => new ComplexNumber(1, 1, -1)).toThrow();
      expect(() => new ComplexNumber(1, 1, NaN)).toThrow();
    });
  });

  describe("tolerance getter and setter", () => {
    it("gets the current tolerance", () => {
      const c = new ComplexNumber(1, 2, 1e-6);
      expect(c.tolerance).toBe(1e-6);
    });

    it("sets a new tolerance", () => {
      const c = new ComplexNumber(1, 2, 1e-6);
      c.tolerance = 1e-4;
      expect(c.tolerance).toBe(1e-4);
    });

    it("throws if setting tolerance to non-positive value", () => {
      const c = new ComplexNumber(1, 2, 1e-6);
      expect(() => { c.tolerance = 0; }).toThrow();
      expect(() => { c.tolerance = -1; }).toThrow();
      expect(() => { c.tolerance = NaN; }).toThrow();
    });
  });

  describe("add", () => {
    it("adds two complex numbers", () => {
      const a = new ComplexNumber(1, 2);
      const b = new ComplexNumber(3, 4);
      const result = a.add(b);
      expect(result.re).toBe(4);
      expect(result.im).toBe(6);
    });
  });

  describe("sub", () => {
    it("subtracts two complex numbers", () => {
      const a = new ComplexNumber(5, 7);
      const b = new ComplexNumber(2, 3);
      const result = a.sub(b);
      expect(result.re).toBe(3);
      expect(result.im).toBe(4);
    });
  });

  describe("mul", () => {
    it("multiplies two complex numbers", () => {
      const a = new ComplexNumber(2, 3);
      const b = new ComplexNumber(4, -5);
      const result = a.mul(b);
      expect(result.re).toBe(2 * 4 - 3 * -5);
      expect(result.im).toBe(2 * -5 + 3 * 4);
    });
  });

  describe("div", () => {
    it("divides two complex numbers", () => {
      const a = new ComplexNumber(7, 5);
      const b = new ComplexNumber(2, -3);
      const result = a.div(b);
      const denom = 2 * 2 + (-3) * (-3);
      expect(result.re).toBeCloseTo((7 * 2 + 5 * -3) / denom);
      expect(result.im).toBeCloseTo((5 * 2 - 7 * -3) / denom);
    });

    it("throws when dividing by zero", () => {
      const a = new ComplexNumber(1, 1);
      const b = new ComplexNumber(0, 0);
      expect(() => a.div(b)).toThrow();
    });
  });

  describe("conj", () => {
    it("returns the complex conjugate", () => {
      const a = new ComplexNumber(2, 3);
      const result = a.conj();
      expect(result.re).toBe(2);
      expect(result.im).toBe(-3);
    });
  });

  describe("abs", () => {
    it("returns the magnitude", () => {
      const a = new ComplexNumber(3, 4);
      expect(a.abs()).toBe(5);
    });
  });

  describe("equals", () => {
    it("returns true for equal complex numbers within tolerance", () => {
      const a = new ComplexNumber(1, 2, 1e-6);
      const b = new ComplexNumber(1 + 1e-7, 2 - 1e-7, 1e-6);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different complex numbers", () => {
      const a = new ComplexNumber(1, 2);
      const b = new ComplexNumber(2, 1);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("returns a string representation", () => {
      const a = new ComplexNumber(2, 3);
      expect(a.toString()).toMatch(/2.*\+.*3i/);
      const b = new ComplexNumber(2, -3);
      expect(b.toString()).toMatch(/2.*-.*3i/);
    });
  });
});
