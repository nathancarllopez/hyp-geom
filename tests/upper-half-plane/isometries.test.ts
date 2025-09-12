import { describe, it, expect } from "vitest";
import { UhpIsometry } from "../../src/upper-half-plane/isometries.js";

describe("Upper Half Plane isometries (upper-half-plane/isometries.ts)", () => {
  describe("constructor", () => {
    it("creates identity isometry when coeffs is null", () => {
      const iso = new UhpIsometry(null);
      expect(iso.type).toBe("identity");
      expect(iso.det).toBe(1);
      expect(iso.tr).toBe(2);
      expect(iso.fixedPoints).toBeNull();
      expect(iso.standardForm).toBe(iso);
      expect(iso.conjToStd).toBeNull();
    });

    it("throws error if rtol or atol are not positive", () => {
      expect(() => new UhpIsometry(null, -1)).toThrow();
      expect(() => new UhpIsometry(null, 1e-5, -1)).toThrow();
    });

    it("throws error if determinant is not one", () => {
      // Determinant check is in MobiusTransformation, so use bad coeffs
      const badCoeffs = [
        { re: 2, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }
      ].map(c => Object.assign(c, { rtol: 1e-5, atol: 1e-8 }));
      expect(() => new UhpIsometry(badCoeffs as any)).toThrow();
    });
  });

  describe("rtol and atol getters/setters", () => {
    it("gets and sets rtol", () => {
      const iso = new UhpIsometry(null, 1e-4, 1e-8);
      expect(iso.rtol).toBe(1e-4);
      iso.rtol = 1e-3;
      expect(iso.rtol).toBe(1e-3);
      expect(() => { iso.rtol = -1; }).toThrow();
    });

    it("gets and sets atol", () => {
      const iso = new UhpIsometry(null, 1e-4, 1e-8);
      expect(iso.atol).toBe(1e-8);
      iso.atol = 1e-7;
      expect(iso.atol).toBe(1e-7);
      expect(() => { iso.atol = -1; }).toThrow();
    });
  });

  describe("compose", () => {
    it("composes two identity isometries", () => {
      const iso1 = new UhpIsometry(null);
      const iso2 = new UhpIsometry(null);
      const composed = iso1.compose(iso2);
      expect(composed.type).toBe("identity");
    });
  });

  describe("conjugate", () => {
    it("conjugates identity with itself", () => {
      const iso1 = new UhpIsometry(null);
      const iso2 = new UhpIsometry(null);
      const conj = iso1.conjugate(iso2);
      expect(conj.type).toBe("identity");
    });
  });

  describe("inverse", () => {
    it("returns inverse of identity", () => {
      const iso = new UhpIsometry(null);
      const inv = iso.inverse();
      expect(inv.type).toBe("identity");
    });
  });

  describe("apply", () => {
    it("applies identity to a point", () => {
      const iso = new UhpIsometry(null);
      const pt: [number, number] = [0, 1];
      const result = iso.apply(pt);
      expect(result.re).toBeCloseTo(0);
      expect(result.im).toBeCloseTo(1);
    });

    it("throws error on invalid argument", () => {
      const iso = new UhpIsometry(null);
      expect(() => iso.apply("bad" as any)).toThrow();
    });
  });

  describe("isConjugateTo", () => {
    it("returns identity for two identity isometries", () => {
      const iso1 = new UhpIsometry(null);
      const iso2 = new UhpIsometry(null);
      const conj = iso1.isConjugateTo(iso2);
      expect(conj).toBeInstanceOf(UhpIsometry);
      expect(conj?.type).toBe("identity");
    });

    it("returns null for different types", () => {
      // Use identity and a fake hyperbolic
      const iso1 = new UhpIsometry(null);
      // Create a hyperbolic isometry by using standardHyperbolic
      const iso2 = UhpIsometry.prototype.standardForm;
      expect(iso1.isConjugateTo(iso2 as any)).toBeNull();
    });
  });
});
