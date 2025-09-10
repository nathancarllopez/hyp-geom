import { expect, describe, it } from "vitest";
import {
  getMobiusTranformations,
  MobiusTransformation,
} from "../../src/general-math/mobius-transformations.js";
import {
  randomComplex,
  randomInvertibleMobius,
  randomMobius,
  randomNonZeroComplex,
  randomReal,
} from "../helpers/random.js";
import {
  ComplexNumber,
  getComplexNumbers,
} from "../../src/general-math/complex-numbers.js";

describe("Mobius Transformations (mobius-transformations.ts)", () => {
  describe("getMobiusTransformations function", () => {
    it("should return constants and factory", () => {
      for (let i = 0; i < 5; i++) {
        const rtol = randomReal(1e-2, true);
        const atol = randomReal(1e-3, true);
        const result = getMobiusTranformations(rtol, atol);

        expect(result).toHaveProperty("constants");
        expect(result).toHaveProperty("factory");

        for (const mobius of Object.values(result.constants)) {
          expect(mobius instanceof MobiusTransformation).toBe(true);
          expect(mobius.rtol).toBe(rtol);
          expect(mobius.atol).toBe(atol);
        }

        const { factory } = result;
        expect(typeof factory).toBe("function");

        for (let i = 0; i < 10; i++) {
          const coeffs: ComplexNumber[] = [];
          for (let i = 0; i < 4; i++) {
            coeffs.push(randomNonZeroComplex(5, rtol, atol));
          }

          const mobius = factory(coeffs);
          expect(mobius instanceof MobiusTransformation).toBe(true);
          expect(mobius.rtol).toBe(rtol);
          expect(mobius.atol).toBe(atol);
        }
      }
    });

    it("should throw if rtol or atol are not positive", () => {
      expect(() => getMobiusTranformations(0, 1e-8)).toThrow();
      expect(() => getMobiusTranformations(1e-5, 0)).toThrow();
      expect(() => getMobiusTranformations(-1, 1e-8)).toThrow();
      expect(() => getMobiusTranformations(1e-5, -1)).toThrow();
    });

    it("IDENTITY transformation should act as identity", () => {
      const {
        constants: { IDENTITY },
      } = getMobiusTranformations();

      for (let i = 0; i < 3; i++) {
        const z = randomComplex();
        expect(IDENTITY.apply(z).isEqualTo(z)).toBe(true);
      }
    });

    it("CAYLEY transformation should map real axis to unit circle", () => {
      const {
        constants: { CAYLEY },
      } = getMobiusTranformations();
      const {
        constants: { ZERO, ONE, I, NEGONE, INFINITY },
      } = CAYLEY;

      // The Cayley transform maps 0 to -1, i to 0, and infinity to 1
      const zeroMapped = CAYLEY.apply(ZERO);
      expect(zeroMapped.isEqualTo(NEGONE)).toBe(true);

      const iMapped = CAYLEY.apply(I);
      expect(iMapped.isEqualTo(ZERO)).toBe(true);

      const infMapped = CAYLEY.apply(INFINITY);
      expect(infMapped.isEqualTo(ONE)).toBe(true);
    });
  });

  describe("MobiusTransformation class", () => {
    const {
      constants: { ZERO, ONE, NEGONE, I, NEGI, INFINITY },
    } = getComplexNumbers();
    const singular = new MobiusTransformation([
      new ComplexNumber(1, 0),
      new ComplexNumber(2, 0),
      new ComplexNumber(3, 0),
      new ComplexNumber(6, 0),
    ]);

    describe("constructor", () => {
      it("creates a MobiusTransformation with valid coefficients", () => {
        const coeffs: ComplexNumber[] = [];
        for (let i = 0; i < 4; i++) {
          coeffs.push(randomNonZeroComplex(5));
        }
        const mobius = new MobiusTransformation(coeffs, 1e-5, 1e-8);
        expect(mobius instanceof MobiusTransformation).toBe(true);
        expect(mobius.coeffs).toHaveLength(4);
        expect(mobius.rtol).toBe(1e-5);
        expect(mobius.atol).toBe(1e-8);
      });

      it("throws if coefficients array length is not 4", () => {
        const coeffs: ComplexNumber[] = [];
        for (let i = 0; i < 3; i++) {
          coeffs.push(randomNonZeroComplex(5));
        }
        expect(() => new MobiusTransformation(coeffs)).toThrow(
          "Must provide exactly four complex numbers as coefficients",
        );
      });

      it("throws if rtol or atol are not positive", () => {
        const coeffs: ComplexNumber[] = [];
        for (let i = 0; i < 4; i++) {
          coeffs.push(randomNonZeroComplex(5));
        }
        expect(() => new MobiusTransformation(coeffs, 0, 1e-8)).toThrow();
        expect(() => new MobiusTransformation(coeffs, 1e-5, 0)).toThrow();
        expect(() => new MobiusTransformation(coeffs, -1, 1e-8)).toThrow();
        expect(() => new MobiusTransformation(coeffs, 1e-5, -1)).toThrow();
      });

      it("throws if denominator coefficients are both zero", () => {
        const coeffs = [
          randomNonZeroComplex(5),
          randomNonZeroComplex(5),
          ZERO,
          ZERO,
        ];
        expect(() => new MobiusTransformation(coeffs)).toThrow(
          "Denominator of mobius transformation cannot be zero",
        );
      });
    });

    describe("rtol and atol getter and setter", () => {
      it("gets the current rtol and atol", () => {
        const mobius = randomMobius();
        expect(mobius.rtol).toBe(1e-5);
        expect(mobius.atol).toBe(1e-8);
      });

      it("sets a new rtol and atol", () => {
        const mobius = randomMobius();
        mobius.rtol = 1e-2;
        mobius.atol = 1e-12;
        expect(mobius.rtol).toBe(1e-2);
        expect(mobius.atol).toBe(1e-12);
      });

      it("throws if setting rtol or atol to non-positive value", () => {
        const mobius = randomMobius();
        expect(() => {
          mobius.rtol = 0;
        }).toThrow();
        expect(() => {
          mobius.rtol = -1;
        }).toThrow();
        expect(() => {
          mobius.rtol = NaN;
        }).toThrow();
        expect(() => {
          mobius.atol = 0;
        }).toThrow();
        expect(() => {
          mobius.atol = -1;
        }).toThrow();
        expect(() => {
          mobius.atol = NaN;
        }).toThrow();
      });
    });

    describe("isEqualTo", () => {
      it("returns true for identical transformations", () => {
        const mobius1 = randomMobius();
        const mobius2 = new MobiusTransformation(
          mobius1.coeffs.map((c) => c.clone()),
          mobius1.rtol,
          mobius1.atol,
        );
        expect(mobius1.isEqualTo(mobius2)).toBe(true);
        expect(mobius2.isEqualTo(mobius1)).toBe(true);
      });

      it("returns true for transformations that act identically on test points", () => {
        const { constants } = getMobiusTranformations();
        const mob1 = constants.IDENTITY;
        const mob2 = constants.IDENTITY.reduce(); // Should still be identity
        expect(mob1.isEqualTo(mob2)).toBe(true);
      });

      it("returns false for transformations that differ on test points", () => {
        const mobius1 = randomMobius();
        // Modify one coefficient to ensure difference
        const coeffs = mobius1.coeffs.map((c, i) =>
          i === 0 ? c.add(mobius1.constants.ONE) : c.clone(),
        );
        const mobius2 = new MobiusTransformation(
          coeffs,
          mobius1.rtol,
          mobius1.atol,
        );
        expect(mobius1.isEqualTo(mobius2)).toBe(false);
      });

      it("returns true for two different representations of the same transformation", () => {
        // Scaling all coefficients by a nonzero complex number should not change the transformation
        const mobius = randomMobius();
        const scale = new ComplexNumber(2, 3);
        const scaledCoeffs = mobius.coeffs.map((c) => c.multiply(scale));
        const mobiusScaled = new MobiusTransformation(
          scaledCoeffs,
          mobius.rtol,
          mobius.atol,
        );
        expect(mobius.isEqualTo(mobiusScaled)).toBe(true);
      });
    });

    describe("determinant", () => {
      it("returns a ComplexNumber instance", () => {
        const mobius = randomMobius();
        const det = mobius.determinant();
        expect(det instanceof ComplexNumber).toBe(true);
      });

      it("computes the correct determinant for known coefficients", () => {
        const mobius = new MobiusTransformation([ONE, I, NEGI, ZERO]);
        // determinant = ad - bc = (1)(0) - (-i)(i) = -1
        expect(mobius.determinant().isEqualTo(NEGONE)).toBe(true);
      });

      it("returns zero for singular transformations", () => {
        expect(singular.determinant().isEqualTo(ZERO)).toBe(true);
      });

      it("is invariant under scaling of coefficients", () => {
        const mobius = randomMobius();
        const scale = new ComplexNumber(2, -1);
        const scaledCoeffs = mobius.coeffs.map((c) => c.multiply(scale));
        const mobiusScaled = new MobiusTransformation(
          scaledCoeffs,
          mobius.rtol,
          mobius.atol,
        );
        // det(scaled) = scale^2 * det(original)
        const expected = mobius.determinant().multiply(scale).multiply(scale);
        expect(mobiusScaled.determinant().isEqualTo(expected)).toBe(true);
      });
    });

    describe("clone", () => {
      it("returns a new MobiusTransformation instance with identical coefficients and tolerances", () => {
        const mobius = randomMobius();
        const clone = mobius.clone();

        expect(clone instanceof MobiusTransformation).toBe(true);
        expect(clone.rtol).toBe(mobius.rtol);
        expect(clone.atol).toBe(mobius.atol);
        expect(clone.coeffs).toHaveLength(4);

        for (let i = 0; i < 4; i++) {
          expect(clone.coeffs[i].isEqualTo(mobius.coeffs[i])).toBe(true);
        }
      });

      it("produces a deep copy: modifying clone's coefficients does not affect original", () => {
        const mobius = randomMobius();
        const clone = mobius.clone();

        // Mutate clone's coefficients
        clone.coeffs[0] = clone.coeffs[0].add(clone.constants.ONE);

        // Original should remain unchanged
        expect(clone.coeffs[0].isEqualTo(mobius.coeffs[0])).toBe(false);
        expect(mobius.coeffs[0].isEqualTo(mobius.coeffs[0])).toBe(true);
      });

      it("cloning a reduced transformation preserves reduction", () => {
        const mobius = randomMobius();
        const reduced = mobius.reduce();
        const clone = reduced.clone();

        expect(clone.isEqualTo(reduced)).toBe(true);
        expect(clone.determinant().isEqualTo(reduced.determinant())).toBe(true);
      });
    });

    describe("reduce", () => {
      it("should return a mobius transformation with determinant 1 when starting with an invertible transformation", () => {
        const mobius = new MobiusTransformation([ONE, I, NEGI, ZERO]);
        const reduced = mobius.reduce();
        // Determinant should be 1 (up to tolerance)
        expect(reduced.determinant().isEqualTo(ONE)).toBe(true);
      });

      it("should return a clone of the original when starting with a non-invertible transformation", () => {
        const reduced = singular.reduce();
        // Should be a clone (not reduced)
        expect(reduced.isEqualTo(singular)).toBe(true);
        expect(reduced).not.toBe(singular); // Should be a different instance
      });

      it("the returned transformation should be equal to the original", () => {
        for (let i = 0; i < 10; i++) {
          const mobius = randomMobius();
          const reduced = mobius.reduce();
          // Should act identically
          expect(mobius.isEqualTo(reduced)).toBe(true);
          expect(reduced.determinant().isEqualTo(ONE)).toBe(true);
        }
      });
    });

    describe("compose", () => {
      it("returns a new MobiusTransformation instance", () => {
        const mob1 = randomMobius();
        const mob2 = randomMobius();
        const composed = mob1.compose(mob2);
        expect(composed instanceof MobiusTransformation).toBe(true);
        expect(composed).not.toBe(mob1);
        expect(composed).not.toBe(mob2);
      });

      it("composition is associative", () => {
        const mob1 = randomMobius();
        const mob2 = randomMobius();
        const mob3 = randomMobius();

        const comp1 = mob1.compose(mob2).compose(mob3);
        const comp2 = mob1.compose(mob2.compose(mob3));
        expect(comp1.isEqualTo(comp2)).toBe(true);
      });

      it("composing with identity returns the original transformation", () => {
        const { constants } = getMobiusTranformations();
        const mob = randomMobius();
        const left = mob.compose(constants.IDENTITY);
        const right = constants.IDENTITY.compose(mob);
        expect(left.isEqualTo(mob)).toBe(true);
        expect(right.isEqualTo(mob)).toBe(true);
      });

      it("composing two transformations applies them in sequence", () => {
        const mob1 = randomMobius();
        const mob2 = randomMobius();
        const composed = mob1.compose(mob2);

        for (let i = 0; i < 3; i++) {
          const z = randomComplex();
          const expected = mob1.apply(mob2.apply(z));
          const actual = composed.apply(z);
          expect(actual.isEqualTo(expected)).toBe(true);
        }
      });

      it("doReduce option returns a reduced transformation", () => {
        const mob1 = randomMobius();
        const mob2 = randomMobius();
        const composed = mob1.compose(mob2, true);
        expect(composed.determinant().isEqualTo(composed.constants.ONE)).toBe(
          true,
        );
      });

      it("determinant of composition is the product of determinants", () => {
        for (let i = 0; i < 5; i++) {
          const mob1 = randomMobius();
          const mob2 = randomMobius();
          const composed = mob1.compose(mob2);

          const det1 = mob1.determinant();
          const det2 = mob2.determinant();
          const detComposed = composed.determinant();

          // det(composed) = det(mob1) * det(mob2)
          expect(detComposed.isEqualTo(det1.multiply(det2))).toBe(true);
        }
      });
    });

    describe("conjugate", () => {
      it("returns a new MobiusTransformation instance", () => {
        const mob1 = randomInvertibleMobius();
        const mob2 = randomInvertibleMobius();
        const conj = mob1.conjugate(mob2);
        expect(conj instanceof MobiusTransformation).toBe(true);
        expect(conj).not.toBe(mob1);
        expect(conj).not.toBe(mob2);
      });

      it("conjugation by identity returns the original transformation", () => {
        const { constants } = getMobiusTranformations();
        const mob = randomInvertibleMobius();
        const conj = mob.conjugate(constants.IDENTITY);
        expect(conj.isEqualTo(mob)).toBe(true);
      });

      it("conjugating identity by any transformation returns identity", () => {
        const { constants } = getMobiusTranformations();
        const mob = randomInvertibleMobius();
        const conj = constants.IDENTITY.conjugate(mob);
        expect(conj.isEqualTo(constants.IDENTITY)).toBe(true);
      });

      it("conjugation is invertible: conjugating by n then by n.inverse returns original", () => {
        const mob = randomMobius();
        const n = randomInvertibleMobius();
        const conj = mob.conjugate(n);
        const reconj = conj.conjugate(n.inverse());
        expect(reconj.isEqualTo(mob)).toBe(true);
      });

      it("throws if conjugating by a non-invertible transformation", () => {
        const mob = randomMobius();
        expect(() => mob.conjugate(singular)).toThrow(
          "Cannot conjugate by a non-invertible transformation",
        );
      });

      it("doReduce option returns a reduced transformation", () => {
        const mob1 = randomMobius();
        const mob2 = randomMobius();
        const conj = mob1.conjugate(mob2, true);
        expect(conj.determinant().isEqualTo(conj.constants.ONE)).toBe(true);
      });

      it("determinant is unchanged under conjugation", () => {
        for (let i = 0; i < 10; i++) {
          const mob = randomMobius(undefined, undefined, undefined, true);
          const n = randomInvertibleMobius();
          const conj = mob.conjugate(n, true);

          const mobDet = mob.determinant();
          const conjDet = conj.determinant();

          expect(conjDet.isEqualTo(mobDet)).toBe(true);
        }
      });
    });

    describe("inverse", () => {
      it("returns a new MobiusTransformation instance", () => {
        const mobius = randomInvertibleMobius();
        const inv = mobius.inverse();
        expect(inv instanceof MobiusTransformation).toBe(true);
        expect(inv).not.toBe(mobius);
      });

      it("inverse is correct for known coefficients", () => {
        const { ONE, I, NEGI, ZERO } = getComplexNumbers().constants;
        const mobius = new MobiusTransformation([ONE, I, NEGI, ZERO]);
        const inv = mobius.inverse();
        // For this transformation, check that composing with inverse yields identity
        const composed = mobius.compose(inv);
        const { constants } = getMobiusTranformations();
        expect(composed.isEqualTo(constants.IDENTITY)).toBe(true);
      });

      it("inverse of inverse returns the original transformation", () => {
        for (let i = 0; i < 10; i++) {
          const mobius = randomInvertibleMobius();
          const inv = mobius.inverse();
          const doubleInv = inv.inverse();
          expect(doubleInv.isEqualTo(mobius)).toBe(true);
        }
      });

      it("inverse composed with original yields identity", () => {
        for (let i = 0; i < 10; i++) {
          const mobius = randomInvertibleMobius();
          const inv = mobius.inverse();
          const { constants } = getMobiusTranformations();

          const composed1 = mobius.compose(inv);
          const composed2 = inv.compose(mobius);

          expect(composed1.isEqualTo(constants.IDENTITY)).toBe(true);
          expect(composed2.isEqualTo(constants.IDENTITY)).toBe(true);
        }
      });

      it("throws if transformation is not invertible", () => {
        expect(() => singular.inverse()).toThrow(
          "Non-invertible transformation",
        );
      });

      it("doReduce option returns a reduced transformation", () => {
        const mobius = randomInvertibleMobius();
        const inv = mobius.inverse(true);
        expect(inv.determinant().isEqualTo(ONE)).toBe(true);
      });

      it("determinant of inverse is the inverse of the determinant", () => {
        for (let i = 0; i < 10; i++) {
          const mobius = randomInvertibleMobius(
            undefined,
            undefined,
            undefined,
            true,
          );
          const inv = mobius.inverse(true);

          const det = mobius.determinant();
          const detInv = inv.determinant();

          // det(inv) * det = 1
          expect(detInv.multiply(det).isEqualTo(ONE)).toBe(true);
        }
      });
    });

    describe("apply", () => {
      it("applies the transformation correctly for known coefficients", () => {
        // Mobius: f(z) = (z + i) / (-i z)
        const mobius = new MobiusTransformation([ONE, I, NEGI, ZERO]);
        // f(0) = i / 0 = INFINITY
        expect(mobius.apply(ZERO).isEqualTo(INFINITY)).toBe(true);
        // f(1) = (1 + i) / (-i * 1) = (1 + i) / -i
        const expected = new ComplexNumber(1, 1).divide(NEGI);
        expect(mobius.apply(ONE).isEqualTo(expected)).toBe(true);
        // f(i) = (i + i) / (-i * i) = (2i) / 1 = 2i
        expect(mobius.apply(I).isEqualTo(new ComplexNumber(0, 2))).toBe(true);
      });

      it("returns INFINITY when denominator is zero", () => {
        // Mobius: f(z) = (1*z + 0) / (1*z + 0) = z/z
        const mobius = new MobiusTransformation([ONE, ZERO, ONE, ZERO]);
        // f(0) = 0/0 = INFINITY
        expect(mobius.apply(ZERO).isEqualTo(INFINITY)).toBe(true);
      });

      it("returns correct value when input is INFINITY", () => {
        // Mobius: f(z) = (1*z + 0) / (0*z + 1) = z/1 = z
        const mobius = new MobiusTransformation([ONE, ZERO, ZERO, ONE]);
        expect(mobius.apply(INFINITY).isEqualTo(INFINITY)).toBe(true); // 1/0 = INFINITY
        // Mobius: f(z) = (1*z + 0) / (1*z + 1)
        const mobius2 = new MobiusTransformation([ONE, ZERO, ONE, ONE]);
        // f(INFINITY) = 1/1 = 1
        expect(mobius2.apply(INFINITY).isEqualTo(ONE)).toBe(true);
      });

      it("applies random transformations to random complex numbers", () => {
        for (let i = 0; i < 10; i++) {
          const mobius = randomMobius();
          for (let j = 0; j < 5; j++) {
            const z = randomComplex();
            const result = mobius.apply(z);
            expect(result instanceof ComplexNumber).toBe(true);
          }
        }
      });

      it("is consistent with composition: mob1.apply(mob2.apply(z)) == mob1.compose(mob2).apply(z)", () => {
        for (let i = 0; i < 10; i++) {
          const mob1 = randomMobius();
          const mob2 = randomMobius();
          for (let j = 0; j < 3; j++) {
            const z = randomComplex();
            const expected = mob1.apply(mob2.apply(z));
            const actual = mob1.compose(mob2).apply(z);
            expect(actual.isEqualTo(expected)).toBe(true);
          }
        }
      });

      it("returns a ComplexNumber for all valid inputs", () => {
        const mobius = randomMobius();
        const { ZERO, ONE, I, NEGI, INFINITY } = getComplexNumbers().constants;
        const inputs = [ZERO, ONE, I, NEGI, INFINITY, randomComplex()];
        for (const z of inputs) {
          const result = mobius.apply(z);
          expect(result instanceof ComplexNumber).toBe(true);
        }
      });
    });
  });
});
