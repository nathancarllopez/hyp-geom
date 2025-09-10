import { describe, it, expect } from "vitest";
import {
  ComplexNumber,
  getComplexNumbers,
} from "../../src/general-math/complex-numbers.js";
import {
  randomComplex,
  randomNonZeroComplex,
  randomReal,
} from "../helpers/random.js";

describe("Testing complex numbers (complex-numbers.ts)", () => {
  describe("getComplexNumbers factory function", () => {
    it("should return a set of complex numbers and a factory function for other complex numbers", () => {
      for (let i = 0; i < 5; i++) {
        const rtol = randomReal(1, true);
        const atol = randomReal(1, true);
        const result = getComplexNumbers(rtol, atol);

        expect(result).toHaveProperty("constants");
        expect(result).toHaveProperty("factory");

        for (const complex of Object.values(result.constants)) {
          expect(complex instanceof ComplexNumber).toBe(true);
          expect(complex.rtol).toBe(rtol);
          expect(complex.atol).toBe(atol);
        }

        const { factory } = result;
        expect(typeof factory).toBe("function");

        for (let i = 0; i < 10; i++) {
          const re = randomReal();
          const im = randomReal();
          const complex = factory(re, im);

          expect(complex instanceof ComplexNumber).toBe(true);
          expect(complex.rtol).toBe(rtol);
          expect(complex.atol).toBe(atol);
        }
      }
    });

    it("throws an error if rtol or atol is not positive", () => {
      expect(() => getComplexNumbers(0, 1e-4)).toThrow();
      expect(() => getComplexNumbers(-1, 1e-4)).toThrow();
      expect(() => getComplexNumbers(NaN, 1e-4)).toThrow();
      expect(() => getComplexNumbers(1e-4, 0)).toThrow();
      expect(() => getComplexNumbers(1e-4, -1)).toThrow();
      expect(() => getComplexNumbers(1e-4, NaN)).toThrow();
    });

    it("constants have correct values", () => {
      const { constants } = getComplexNumbers();
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
  });

  describe("ComplexNumber class", () => {
    describe("constructor", () => {
      it("creates a complex number with given real and imaginary parts", () => {
        const c = new ComplexNumber(2, 3, 1e-5, 1e-6);
        expect(c.re).toBe(2);
        expect(c.im).toBe(3);
        expect(c.rtol).toBe(1e-5);
        expect(c.atol).toBe(1e-6);
      });

      it("defaults rtol and atol to 1e-5 and 1e-8 if not provided", () => {
        const c = new ComplexNumber(1, 1);
        expect(c.rtol).toBe(1e-5);
        expect(c.atol).toBe(1e-8);
      });

      it("throws if rtol or atol is not positive", () => {
        expect(() => new ComplexNumber(1, 1, 0, 1e-4)).toThrow();
        expect(() => new ComplexNumber(1, 1, -1, 1e-4)).toThrow();
        expect(() => new ComplexNumber(1, 1, NaN, 1e-4)).toThrow();
        expect(() => new ComplexNumber(1, 1, 1e-4, 0)).toThrow();
        expect(() => new ComplexNumber(1, 1, 1e-4, -1)).toThrow();
        expect(() => new ComplexNumber(1, 1, 1e-4, NaN)).toThrow();
      });

      it("calculates modulus correctly for various complex numbers", () => {
        const cases = [
          { re: 3, im: 4, expected: 5 },
          { re: 0, im: 0, expected: 0 },
          { re: 1, im: 0, expected: 1 },
          { re: 0, im: 2, expected: 2 },
          { re: -5, im: 12, expected: 13 },
          { re: 0.6, im: 0.8, expected: 1 },
          { re: -1, im: -1, expected: Math.sqrt(2) },
        ];
        for (const { re, im, expected } of cases) {
          const c = new ComplexNumber(re, im);
          expect(c.modulus).toBeCloseTo(expected);
        }
      });

      it("modulus is Infinity for infinity complex number", () => {
        const inf = new ComplexNumber(Infinity, Infinity);
        expect(inf.modulus).toBe(Infinity);
      });
    });

    describe("rtol and atol getter and setter", () => {
      it("gets the current rtol and atol", () => {
        const c = new ComplexNumber(1, 2, 1e-6, 1e-7);
        expect(c.rtol).toBe(1e-6);
        expect(c.atol).toBe(1e-7);
      });

      it("sets a new rtol and atol", () => {
        const c = new ComplexNumber(1, 2);
        c.rtol = 1e-2;
        c.atol = 1e-12;
        expect(c.rtol).toBe(1e-2);
        expect(c.atol).toBe(1e-12);
      });

      it("throws if setting rtol or atol to non-positive value", () => {
        const c = new ComplexNumber(1, 2);
        expect(() => {
          c.rtol = 0;
        }).toThrow();
        expect(() => {
          c.rtol = -1;
        }).toThrow();
        expect(() => {
          c.rtol = NaN;
        }).toThrow();
        expect(() => {
          c.atol = 0;
        }).toThrow();
        expect(() => {
          c.atol = -1;
        }).toThrow();
        expect(() => {
          c.atol = NaN;
        }).toThrow();
      });
    });

    describe("isEqualTo", () => {
      it("returns true for exactly equal complex numbers", () => {
        const a = new ComplexNumber(1, 2);
        const b = new ComplexNumber(1, 2);
        expect(a.isEqualTo(b)).toBe(true);
      });

      it("returns true for numbers equal within rtol/atol", () => {
        const a = new ComplexNumber(1, 2, 1e-5, 1e-8);
        const b = new ComplexNumber(1 + 1e-8, 2 - 1e-8, 1e-5, 1e-8);
        expect(a.isEqualTo(b)).toBe(true);
      });

      it("returns false for numbers outside tolerance", () => {
        const a = new ComplexNumber(1, 2, 1e-5, 1e-8);
        const b = new ComplexNumber(1.1, 2.1, 1e-5, 1e-8);
        expect(a.isEqualTo(b)).toBe(false);
      });

      it("returns true for infinity only if both are infinity", () => {
        const inf1 = new ComplexNumber(Infinity, Infinity);
        const inf2 = new ComplexNumber(Infinity, Infinity);
        expect(inf1.isEqualTo(inf2)).toBe(true);

        for (let i = 0; i < 10; i++) {
          const notInf = randomComplex();
          expect(inf1.isEqualTo(notInf)).toBe(false);
          expect(inf2.isEqualTo(notInf)).toBe(false);
        }
      });

      it("returns false for different real or imaginary parts", () => {
        const a = new ComplexNumber(1, 2);
        const b = new ComplexNumber(2, 2);
        const c = new ComplexNumber(1, 3);
        expect(a.isEqualTo(b)).toBe(false);
        expect(a.isEqualTo(c)).toBe(false);
      });

      it("works with negative and zero values", () => {
        const a = new ComplexNumber(-1, 0);
        const b = new ComplexNumber(-1, 0);
        expect(a.isEqualTo(b)).toBe(true);

        const c = new ComplexNumber(0, -1);
        const d = new ComplexNumber(0, -1);
        expect(c.isEqualTo(d)).toBe(true);
      });
    });

    describe("scale", () => {
      it("scales a complex number by a real scalar", () => {
        const a = new ComplexNumber(2, 3);
        const result = a.scale(4);
        expect(result.re).toBe(8);
        expect(result.im).toBe(12);
      });

      it("scaling by zero yields zero", () => {
        const a = new ComplexNumber(5, -7);
        const result = a.scale(0);
        const zero = new ComplexNumber(0, 0);
        expect(result.isEqualTo(zero)).toBe(true);
      });

      it("scaling by one yields the same complex number", () => {
        const a = new ComplexNumber(-2, 3);
        const result = a.scale(1);
        expect(result.isEqualTo(a)).toBe(true);
      });

      it("scaling by negative numbers flips the sign", () => {
        const a = new ComplexNumber(2, -3);
        const result = a.scale(-2);
        expect(result.re).toBe(-4);
        expect(result.im).toBe(6);
      });

      it("scaling is distributive over addition", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const lambda = randomReal();
          const left = a.add(b).scale(lambda);
          const right = a.scale(lambda).add(b.scale(lambda));
          expect(left.isEqualTo(right)).toBe(true);
        }
      });

      it("scaling is associative: a.scale(x).scale(y) == a.scale(x * y)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const x = randomReal();
          const y = randomReal();
          const left = a.scale(x).scale(y);
          const right = a.scale(x * y);
          expect(left.isEqualTo(right)).toBe(true);
        }
      });
    });

    describe("conjugate", () => {
      it("returns the complex conjugate", () => {
        const a = new ComplexNumber(2, 3);
        const result = a.conjugate();
        expect(result.re).toBe(2);
        expect(result.im).toBe(-3);
      });

      it("conjugate of a real number returns itself", () => {
        const a = new ComplexNumber(5, 0);
        const result = a.conjugate();
        expect(result.isEqualTo(a)).toBe(true);
      });

      it("conjugate of a purely imaginary number negates the imaginary part", () => {
        const a = new ComplexNumber(0, 7);
        const result = a.conjugate();
        expect(result.isEqualTo(a.scale(-1))).toBe(true);
      });

      it("conjugate of zero is zero", () => {
        const zero = new ComplexNumber(0, 0);
        const result = zero.conjugate();
        expect(result.isEqualTo(zero)).toBe(true);
      });

      it("conjugate of conjugate returns the original number", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const conj = a.conjugate();
          const conjConj = conj.conjugate();
          expect(conjConj.isEqualTo(a)).toBe(true);
        }
      });

      it("conjugate distributes over addition", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const left = a.add(b).conjugate();
          const right = a.conjugate().add(b.conjugate());
          expect(left.isEqualTo(right)).toBe(true);
        }
      });

      it("conjugate distributes over subtraction", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const left = a.subtract(b).conjugate();
          const right = a.conjugate().subtract(b.conjugate());
          expect(left.isEqualTo(right)).toBe(true);
        }
      });

      it("conjugate distributes over multiplication", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const left = a.multiply(b).conjugate();
          const right = a.conjugate().multiply(b.conjugate());
          expect(left.isEqualTo(right)).toBe(true);
        }
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

      it("adds complex numbers with negative and zero values", () => {
        const a = new ComplexNumber(-1, 0);
        const b = new ComplexNumber(0, -2);
        const result = a.add(b);
        expect(result.re).toBe(-1);
        expect(result.im).toBe(-2);
      });

      it("adds complex numbers with large values", () => {
        const a = new ComplexNumber(1e10, 2e10);
        const b = new ComplexNumber(-1e10, -2e10);
        const result = a.add(b);
        expect(result.re).toBe(0);
        expect(result.im).toBe(0);
      });

      it("adds complex numbers with fractional values", () => {
        const a = new ComplexNumber(0.5, 0.25);
        const b = new ComplexNumber(0.75, 0.75);
        const result = a.add(b);
        expect(result.re).toBeCloseTo(1.25);
        expect(result.im).toBeCloseTo(1.0);
      });

      it("is commutative: a.add(b) equals b.add(a)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const sum1 = a.add(b);
          const sum2 = b.add(a);

          expect(sum1.isEqualTo(sum2)).toBe(true);
        }
      });

      it("is associative: (a.add(b)).add(c) equals a.add(b.add(c))", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const c = randomComplex();

          const sum1 = a.add(b).add(c);
          const sum2 = a.add(b.add(c));

          expect(sum1.isEqualTo(sum2)).toBe(true);
        }
      });

      it("adding zero does not change the number", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const zero = new ComplexNumber(0, 0, a.rtol, a.atol);
          const result = a.add(zero);

          expect(result.isEqualTo(a)).toBe(true);
        }
      });

      it("adding the negative of a complex number yields zero", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const negA = new ComplexNumber(-a.re, -a.im, a.rtol, a.atol);
          const zero = new ComplexNumber(0, 0, a.rtol, a.atol);
          const sum = a.add(negA);

          expect(sum.isEqualTo(zero));
        }
      });
    });

    describe("subtract", () => {
      it("subtracts two complex numbers", () => {
        const a = new ComplexNumber(5, 7);
        const b = new ComplexNumber(2, 3);
        const result = a.subtract(b);
        expect(result.re).toBe(3);
        expect(result.im).toBe(4);
      });

      it("subtracts complex numbers with negative and zero values", () => {
        const a = new ComplexNumber(-1, 0);
        const b = new ComplexNumber(0, -2);
        const result = a.subtract(b);
        expect(result.re).toBe(-1);
        expect(result.im).toBe(2);
      });

      it("subtracts complex numbers with large values", () => {
        const a = new ComplexNumber(1e10, 2e10);
        const b = new ComplexNumber(-1e10, -2e10);
        const result = a.subtract(b);
        expect(result.re).toBe(2e10);
        expect(result.im).toBe(4e10);
      });

      it("subtracts complex numbers with fractional values", () => {
        const a = new ComplexNumber(0.5, 0.25);
        const b = new ComplexNumber(0.75, 0.75);
        const result = a.subtract(b);
        expect(result.re).toBeCloseTo(-0.25);
        expect(result.im).toBeCloseTo(-0.5);
      });

      it("is anti-commutative: a.subtract(b) equals -(b.subtract(a))", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const diff1 = a.subtract(b);
          const diff2 = b.subtract(a);
          expect(diff1.re).toBeCloseTo(-diff2.re);
          expect(diff1.im).toBeCloseTo(-diff2.im);
        }
      });

      it("subtracting zero does not change the number", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const zero = new ComplexNumber(0, 0, a.rtol, a.atol);
          const result = a.subtract(zero);

          expect(result.isEqualTo(a)).toBe(true);
        }
      });

      it("subtracting a number from itself yields zero", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const result = a.subtract(a);
          const zero = new ComplexNumber(0, 0, a.rtol, a.atol);

          expect(result.isEqualTo(zero)).toBe(true);
        }
      });
    });

    describe("multiply", () => {
      it("multiplies two complex numbers", () => {
        const a = new ComplexNumber(2, 3);
        const b = new ComplexNumber(4, -5);
        const result = a.multiply(b);
        expect(result.re).toBe(2 * 4 - 3 * -5);
        expect(result.im).toBe(2 * -5 + 3 * 4);
      });

      it("multiplies complex numbers with zero", () => {
        const a = new ComplexNumber(0, 0);
        const b = new ComplexNumber(5, -7);
        const result = a.multiply(b);
        expect(result.re).toBe(0);
        expect(result.im).toBe(0);

        const result2 = b.multiply(a);
        expect(result2.re).toBe(0);
        expect(result2.im).toBe(0);
      });

      it("multiplies complex numbers with negative values", () => {
        const a = new ComplexNumber(-2, -3);
        const b = new ComplexNumber(-4, 5);
        const result = a.multiply(b);
        expect(result.re).toBe(-2 * -4 - -3 * 5);
        expect(result.im).toBe(-2 * 5 + -3 * -4);
      });

      it("multiplies complex numbers with fractional values", () => {
        const a = new ComplexNumber(0.5, 0.25);
        const b = new ComplexNumber(0.75, 0.75);
        const result = a.multiply(b);
        expect(result.re).toBeCloseTo(0.5 * 0.75 - 0.25 * 0.75);
        expect(result.im).toBeCloseTo(0.5 * 0.75 + 0.25 * 0.75);
      });

      it("is commutative: a.multiply(b) equals b.multiply(a)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const prod1 = a.multiply(b);
          const prod2 = b.multiply(a);

          expect(prod1.isEqualTo(prod2)).toBe(true);
        }
      });

      it("is associative: (a.multiply(b)).multiply(c) equals a.multiply(b.multiply(c))", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const c = randomComplex();
          const prod1 = a.multiply(b).multiply(c);
          const prod2 = a.multiply(b.multiply(c));

          expect(prod1.isEqualTo(prod2)).toBe(true);
        }
      });

      it("multiplying by one does not change the number", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const one = new ComplexNumber(1, 0, a.rtol, a.atol);
          const result = a.multiply(one);

          expect(result.isEqualTo(a)).toBe(true);
        }
      });

      it("multiplying by zero yields zero", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const zero = new ComplexNumber(0, 0, a.rtol, a.atol);
          const result = a.multiply(zero);

          expect(result.isEqualTo(zero)).toBe(true);
        }
      });

      it("multiplying a number by its inverse yields one", () => {
        const one = new ComplexNumber(1, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const inv = a.inverse();
          const prod = a.multiply(inv);

          expect(prod.isEqualTo(one)).toBe(true);
        }
      });
    });

    describe("inverse", () => {
      it("computes the multiplicative inverse of a nonzero complex number", () => {
        const a = new ComplexNumber(3, 4);
        const inv = a.inverse();

        // The inverse of (3 + 4i) is (3 - 4i) / (3^2 + 4^2) = (3/25, -4/25)
        const expected = new ComplexNumber(3 / 25, -4 / 25);

        expect(expected.isEqualTo(inv)).toBe(true);
      });

      it("inverse of purely real number", () => {
        const a = new ComplexNumber(5, 0);
        const inv = a.inverse();
        expect(inv.re).toBeCloseTo(1 / 5);
        expect(inv.im).toBeCloseTo(0);
      });

      it("inverse of purely imaginary number", () => {
        const a = new ComplexNumber(0, 2);
        const inv = a.inverse();
        expect(inv.re).toBeCloseTo(0);
        expect(inv.im).toBeCloseTo(-0.5);
      });

      it("throws when trying to invert zero", () => {
        const zero = new ComplexNumber(0, 0);
        expect(() => zero.inverse()).toThrow("Zero has no inverse.");
      });

      it("inverse of inverse returns the original number", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const inv = a.inverse();
          const invInv = inv.inverse();

          expect(invInv.isEqualTo(a)).toBe(true);
        }
      });

      it("multiplying a number by its inverse yields one", () => {
        const one = new ComplexNumber(1, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const inv = a.inverse();
          const prod = a.multiply(inv);

          expect(prod.isEqualTo(one)).toBe(true);
        }
      });
    });

    describe("divide", () => {
      it("divides two complex numbers", () => {
        const a = new ComplexNumber(7, 5);
        const b = new ComplexNumber(2, -3);
        const result = a.divide(b);
        const denom = 2 * 2 + -3 * -3;
        expect(result.re).toBeCloseTo((7 * 2 + 5 * -3) / denom);
        expect(result.im).toBeCloseTo((5 * 2 - 7 * -3) / denom);
      });

      it("throws when dividing by zero", () => {
        const a = new ComplexNumber(1, 1);
        const b = new ComplexNumber(0, 0);
        expect(() => a.divide(b)).toThrow("Cannot divide by zero.");
      });

      it("dividing a complex number by itself yields one", () => {
        const one = new ComplexNumber(1, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const result = a.divide(a);

          expect(result.isEqualTo(one)).toBe(true);
        }
      });

      it("dividing by one yields the original number", () => {
        const one = new ComplexNumber(1, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const result = a.divide(one);

          expect(result.isEqualTo(a)).toBe(true);
        }
      });

      it("dividing zero by any nonzero complex yields zero", () => {
        const zero = new ComplexNumber(0, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const result = zero.divide(a);

          expect(result.isEqualTo(zero)).toBe(true);
        }
      });

      it("division by negative one negates the complex number", () => {
        const negOne = new ComplexNumber(-1, 0);

        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const result = a.divide(negOne);
          const expected = a.scale(-1);

          expect(result.isEqualTo(expected)).toBe(true);
        }
      });

      it("division distributes over addition: (a.add(b)).divide(c) == a.divide(c).add(b.divide(c)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          const c = randomNonZeroComplex();

          const left = a.add(b).divide(c);
          const right = a.divide(c).add(b.divide(c));

          expect(left.isEqualTo(right)).toBe(true);
        }
      });
    });

    describe("eucDistance", () => {
      it("returns the Euclidean distance between two complex numbers", () => {
        const a = new ComplexNumber(3, 4);
        const b = new ComplexNumber(0, 0);
        expect(a.eucDistance(b)).toBeCloseTo(5);
      });

      it("returns zero when comparing a complex number to itself", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          expect(a.eucDistance(a)).toBeCloseTo(0);
        }
      });

      it("is symmetric: eucDistance(a, b) == eucDistance(b, a)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomComplex();
          const b = randomComplex();
          expect(a.eucDistance(b)).toBeCloseTo(b.eucDistance(a));
        }
      });

      it("works for negative and fractional values", () => {
        const a = new ComplexNumber(-1, -1);
        const b = new ComplexNumber(1, 1);
        expect(a.eucDistance(b)).toBeCloseTo(Math.sqrt(8));
        const c = new ComplexNumber(0.5, 0.5);
        const d = new ComplexNumber(0.25, 0.75);
        expect(c.eucDistance(d)).toBeCloseTo(
          Math.sqrt((0.5 - 0.25) ** 2 + (0.5 - 0.75) ** 2),
        );
      });

      it("distance between zero and purely real/imaginary numbers", () => {
        const zero = new ComplexNumber(0, 0);
        const real = new ComplexNumber(5, 0);
        const imag = new ComplexNumber(0, -7);
        expect(zero.eucDistance(real)).toBeCloseTo(5);
        expect(zero.eucDistance(imag)).toBeCloseTo(7);
      });

      it("distance between two large numbers", () => {
        const a = new ComplexNumber(1e6, 2e6);
        const b = new ComplexNumber(-1e6, -2e6);
        expect(a.eucDistance(b)).toBeCloseTo(Math.hypot(2e6, 4e6));
      });
    });

    describe("angleBetween", () => {
      it("returns the absolute difference between arguments", () => {
        const one = new ComplexNumber(1, 0); // argument = 0
        const b = new ComplexNumber(0, 1); // argument = pi/2
        expect(one.angleBetween(b)).toBeCloseTo(Math.PI / 2);

        const c = new ComplexNumber(-1, 0); // argument = pi
        expect(one.angleBetween(c)).toBeCloseTo(Math.PI);

        const d = new ComplexNumber(0, -1); // argument = -pi/2
        expect(one.angleBetween(d)).toBeCloseTo(Math.PI / 2);

        const e = new ComplexNumber(1, 1); // argument = pi/4
        expect(one.angleBetween(e)).toBeCloseTo(Math.PI / 4);
      });

      it("returns zero when comparing a complex number to itself", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          expect(a.angleBetween(a)).toBeCloseTo(0);
        }
      });

      it("is symmetric: angleBetween(a, b) == angleBetween(b, a)", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const b = randomNonZeroComplex();
          expect(a.angleBetween(b)).toBeCloseTo(b.angleBetween(a));
        }
      });

      it("throws when either argument is infinity", () => {
        const inf = new ComplexNumber(Infinity, Infinity);
        const a = new ComplexNumber(1, 2);
        expect(() => inf.angleBetween(a)).toThrow(
          "Cannot find an angle with infinity",
        );
        expect(() => a.angleBetween(inf)).toThrow(
          "Cannot find an angle with infinity",
        );
        expect(() => inf.angleBetween(inf)).toThrow(
          "Cannot find an angle with infinity",
        );
      });

      it("throws when either argument is zero", () => {
        const zero = new ComplexNumber(0, 0);
        const a = new ComplexNumber(1, 2);
        expect(() => zero.angleBetween(a)).toThrow(
          "Cannot find an angle with zero",
        );
        expect(() => a.angleBetween(zero)).toThrow(
          "Cannot find an angle with zero",
        );
        expect(() => zero.angleBetween(zero)).toThrow(
          "Cannot find an angle with zero",
        );
      });

      it("works for negative and fractional values", () => {
        const a = new ComplexNumber(-1, 1); // argument = 3*pi/4
        const b = new ComplexNumber(1, -1); // argument = -pi/4
        expect(a.angleBetween(b)).toBeCloseTo(
          Math.abs((3 * Math.PI) / 4 - -Math.PI / 4),
        );
      });
    });

    describe("principalNthRoot", () => {
      it("computes the principal square root of a positive real number", () => {
        const a = new ComplexNumber(4, 0);
        const root = a.principalNthRoot(2);
        expect(root.re).toBeCloseTo(2);
        expect(root.im).toBeCloseTo(0);
      });

      it("computes the principal square root of a negative real number", () => {
        const a = new ComplexNumber(-9, 0);
        const root = a.principalNthRoot(2);
        expect(root.re).toBeCloseTo(0);
        expect(root.im).toBeCloseTo(3);
      });

      it("computes the principal square root of a purely imaginary number", () => {
        const a = new ComplexNumber(0, 16);
        const root = a.principalNthRoot(2);
        // sqrt(16i) = 2√2 + 2√2 i
        expect(root.re).toBeCloseTo(Math.sqrt(8));
        expect(root.im).toBeCloseTo(Math.sqrt(8));
      });

      it("computes the principal cube root of a real number", () => {
        const a = new ComplexNumber(8, 0);
        const root = a.principalNthRoot(3);
        expect(root.re).toBeCloseTo(2);
        expect(root.im).toBeCloseTo(0);
      });

      it("computes the principal nth root for n=1 (identity)", () => {
        const a = new ComplexNumber(5, -3);
        const root = a.principalNthRoot(1);
        expect(root.isEqualTo(a)).toBe(true);
      });

      it("returns 1 for n=0", () => {
        const a = new ComplexNumber(7, 4);
        const root = a.principalNthRoot(0);
        expect(root.re).toBeCloseTo(1);
        expect(root.im).toBeCloseTo(0);
      });

      it("throws when taking root of infinity", () => {
        const inf = new ComplexNumber(Infinity, Infinity);
        expect(() => inf.principalNthRoot(2)).toThrow(
          "Cannot take a root of infinity",
        );
      });

      it("principalNthRoot of zero is zero for n > 0", () => {
        const zero = new ComplexNumber(0, 0);
        for (let n = 1; n <= 10; n++) {
          const root = zero.principalNthRoot(n);
          expect(root.isEqualTo(zero)).toBe(true);
        }
      });

      it("principalNthRoot is consistent with multiplication: root^n ≈ original", () => {
        for (let i = 0; i < 10; i++) {
          const a = randomNonZeroComplex();
          const n = Math.floor(Math.random() * 4) + 2; // n in [2,5]
          const root = a.principalNthRoot(n);
          let prod = root;
          for (let j = 1; j < n; j++) {
            prod = prod.multiply(root);
          }

          expect(prod.isEqualTo(a)).toBe(true);
        }
      });
    });

    describe("clone", () => {
      it("produces a new ComplexNumber instance with the same real, imaginary parts, and tolerances", () => {
        const a = new ComplexNumber(5, -3, 1e-4, 1e-7);
        const clone = a.clone();
        expect(clone).not.toBe(a); // Should be a different instance
        expect(clone instanceof ComplexNumber).toBe(true);
        expect(clone.re).toBe(a.re);
        expect(clone.im).toBe(a.im);
        expect(clone.rtol).toBe(a.rtol);
        expect(clone.atol).toBe(a.atol);
        expect(clone.isEqualTo(a)).toBe(true);
      });

      it("cloning zero yields a new zero complex number", () => {
        const zero = new ComplexNumber(0, 0, 1e-5, 1e-8);
        const clone = zero.clone();
        expect(clone).not.toBe(zero);
        expect(clone.isEqualTo(zero)).toBe(true);
      });

      it("cloning infinity yields a new infinity complex number", () => {
        const inf = new ComplexNumber(Infinity, Infinity, 1e-5, 1e-8);
        const clone = inf.clone();
        expect(clone).not.toBe(inf);
        expect(clone.isEqualTo(inf)).toBe(true);
      });

      it("cloning preserves rtol and atol even after they are changed", () => {
        const a = new ComplexNumber(2, 3);
        a.rtol = 1e-3;
        a.atol = 1e-6;
        const clone = a.clone();
        expect(clone.rtol).toBe(1e-3);
        expect(clone.atol).toBe(1e-6);
      });

      it("multiple clones are independent instances but equal in value", () => {
        const a = new ComplexNumber(-7, 4, 1e-4, 1e-9);
        const clone1 = a.clone();
        const clone2 = a.clone();
        expect(clone1).not.toBe(clone2);
        expect(clone1.isEqualTo(clone2)).toBe(true);
        expect(clone1.isEqualTo(a)).toBe(true);
      });
    });
  });
});
