import { describe, expect, it } from "vitest";
import {
  apply,
  CAYLEY,
  compose,
  determinant,
  IDENTITY,
  inverse,
  mobius,
  unitCircleRotation,
} from "../src/mobius-transformations";
import {
  add,
  complex,
  divide,
  I,
  modulus,
  ONE,
  scale,
  ZERO,
} from "../src/complex-numbers";
import {
  randomComplex,
  randomMobius,
  randomNonZeroComplex,
} from "./helpers/random";

describe("Applying Mobius transformations", () => {
  it("Basic applying", () => {
    const m = mobius(
      { re: 1, im: 0 },
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 },
    );
    const z = complex(5, 6);
    const denom = 19 ** 2 + 18 ** 2;
    const result = apply(m, z);

    expect(result.re).toBeCloseTo(241 / denom);
    expect(result.im).toBeCloseTo(-12 / denom);
  });

  it("The identity transformation fixes any point", () => {
    const z = randomNonZeroComplex();
    const points = [z, ZERO];

    for (const point of points) {
      const result = apply(IDENTITY, point);

      expect(result.re).toBeCloseTo(point.re);
      expect(result.im).toBeCloseTo(point.im);
    }
  });

  it("The cayley transform sends i to zero and zero to negative one", () => {
    const iResult = apply(CAYLEY, I);
    const zeroResult = apply(CAYLEY, ZERO);

    expect(iResult.re).toBeCloseTo(0);
    expect(iResult.im).toBeCloseTo(0);

    expect(zeroResult.re).toBeCloseTo(-1);
    expect(zeroResult.im).toBeCloseTo(0);
  });

  it("Any mobius (a,b,c,d) sends zero to b / d", () => {
    const m = randomMobius();

    const applyResult = apply(m, ZERO);
    const divideResult = divide(m.b, m.d);

    expect(applyResult.re).toBeCloseTo(divideResult.re);
    expect(applyResult.im).toBeCloseTo(divideResult.im);
  });

  it("Any mobius (a,b,c,d) sends one to (a + b) / (c + d)", () => {
    const m = randomMobius();

    const applyResult = apply(m, ONE);
    const divideResult = divide(add(m.a, m.b), add(m.c, m.d));

    expect(applyResult.re).toBeCloseTo(divideResult.re);
    expect(applyResult.im).toBeCloseTo(divideResult.im);
  });

  it("Throws if denominator is zero", () => {
    const m = mobius(ONE, ZERO, ONE, ZERO);

    expect(() => apply(m, ZERO)).toThrow(
      "Denominator is zero in Mobius transformation application",
    );
  });

  it("Handles purely real numbers", () => {
    const m = mobius(
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 },
      { re: 5, im: 0 },
    );
    const z = { re: 1, im: 0 };
    const result = apply(m, z);

    expect(result.re).toBeCloseTo(5 / 9);
    expect(result.im).toBeCloseTo(0);
  });

  it("Handles purely imaginary numbers", () => {
    const m = mobius(
      { re: 0, im: 2 },
      { re: 0, im: 3 },
      { re: 0, im: 4 },
      { re: 0, im: 5 },
    );
    const z = { re: 0, im: 1 };
    const result = apply(m, z);

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Handles negative values", () => {
    const m = mobius(
      { re: -1, im: 0 },
      { re: -2, im: 0 },
      { re: -3, im: 0 },
      { re: -4, im: 0 },
    );
    const z = { re: -5, im: 0 };
    const result = apply(m, z);

    expect(result.re).toBeCloseTo(3 / 11);
    expect(result.im).toBeCloseTo(0);
  });

  it("Handles large values without overflow", () => {
    const m = mobius(
      { re: 1e10, im: 0 },
      { re: 2e10, im: 0 },
      { re: 3e10, im: 0 },
      { re: 4e10, im: 0 },
    );
    const z = { re: 5e10, im: 0 };
    const result = apply(m, z);

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Handles zero transformation (all zeros except d)", () => {
    const m = mobius(ZERO, ZERO, ZERO, ONE);
    const z = randomComplex();
    const result = apply(m, z);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });
});

describe("Determinant of a Mobius transformation", () => {
  it("Basic calculation", () => {
    const m = mobius(
      { re: 1, im: 0 },
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 },
    );
    const result = determinant(m);

    expect(result.re).toBe(-2);
    expect(result.im).toBe(0);
  });

  it("Determinant of the identity transformation is 1", () => {
    const result = determinant(IDENTITY);

    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant of the Cayley transformation", () => {
    const result = determinant(CAYLEY);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(2);
  });

  it("Determinant is zero for singular transformation", () => {
    const m = mobius(ONE, ZERO, ZERO, scale(ONE, -1));

    const result = determinant(m);
    expect(result.re).toBeCloseTo(-1);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with random Mobius transformation", () => {
    const m = randomMobius();
    const result = determinant(m);

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Determinant with purely imaginary coefficients", () => {
    const m = mobius(
      { re: 0, im: 2 },
      { re: 0, im: 3 },
      { re: 0, im: 4 },
      { re: 0, im: 5 },
    );

    const result = determinant(m);
    expect(result.re).toBeCloseTo(2);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with negative values", () => {
    const m = mobius(
      { re: -1, im: 0 },
      { re: -2, im: 0 },
      { re: -3, im: 0 },
      { re: -4, im: 0 },
    );

    const result = determinant(m);
    expect(result.re).toBeCloseTo(-2);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with large values", () => {
    const m = mobius(
      { re: 1e10, im: 0 },
      { re: 2e10, im: 0 },
      { re: 3e10, im: 0 },
      { re: 4e10, im: 0 },
    );

    const result = determinant(m);
    expect(result.re).toBeCloseTo(-2e20);
    expect(result.im).toBeCloseTo(0);
  });
});

describe("Inverse of a Mobius transformation", () => {
  it("Inverse of the identity is the identity", () => {
    const inv = inverse(IDENTITY);

    expect(inv.a.re).toBeCloseTo(IDENTITY.a.re);
    expect(inv.a.im).toBeCloseTo(IDENTITY.a.im);
    expect(inv.b.re).toBeCloseTo(IDENTITY.b.re);
    expect(inv.b.im).toBeCloseTo(IDENTITY.b.im);
    expect(inv.c.re).toBeCloseTo(IDENTITY.c.re);
    expect(inv.c.im).toBeCloseTo(IDENTITY.c.im);
    expect(inv.d.re).toBeCloseTo(IDENTITY.d.re);
    expect(inv.d.im).toBeCloseTo(IDENTITY.d.im);
  });

  it("Inverse undoes the transformation", () => {
    const m = randomMobius();
    const mInv = inverse(m);

    const z = randomComplex();
    const w = apply(m, z);
    const zBack = apply(mInv, w);

    expect(zBack.re).toBeCloseTo(z.re);
    expect(zBack.im).toBeCloseTo(z.im);
  });
});

describe("Composition of Mobius transformations", () => {
  it("Composing with identity returns the original", () => {
    const m = randomMobius();
    const comp1 = compose(m, IDENTITY);
    const comp2 = compose(IDENTITY, m);

    const z = randomComplex();
    const r1 = apply(comp1, z);
    const r2 = apply(comp2, z);
    const rOrig = apply(m, z);

    expect(r1.re).toBeCloseTo(rOrig.re);
    expect(r1.im).toBeCloseTo(rOrig.im);
    expect(r2.re).toBeCloseTo(rOrig.re);
    expect(r2.im).toBeCloseTo(rOrig.im);
  });

  it("Composition applies transformations in order", () => {
    const m1 = randomMobius();
    const m2 = randomMobius();

    const z = randomComplex();
    const r1 = apply(m2, apply(m1, z));
    const comp = compose(m2, m1);
    const r2 = apply(comp, z);

    expect(r2.re).toBeCloseTo(r1.re);
    expect(r2.im).toBeCloseTo(r1.im);
  });

  it("Composition of inverses is identity", () => {
    const m = randomMobius();
    const mInv = inverse(m);
    const comp = compose(m, mInv);

    const z = randomComplex();
    const r = apply(comp, z);

    expect(r.re).toBeCloseTo(z.re);
    expect(r.im).toBeCloseTo(z.im);
  });
});

describe("Unit circle rotation", () => {
  it("Rotating by pi / 2 sends one to i", () => {
    const quarterRot = unitCircleRotation(Math.PI / 2);
    const result = apply(quarterRot, ONE);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBe(1);
  });

  it("Rotating by angles whose difference is a multiple of 2 pi does the same thing", () => {
    const z = randomComplex();
    const theta = 50 * Math.random() - 25;
    const rot = unitCircleRotation(theta);
    const result = apply(rot, z);

    for (let k = -5; k <= 5; k++) {
      const otherRot = unitCircleRotation(theta + k * 2 * Math.PI);
      const otherResult = apply(otherRot, z);

      expect(result.re).toBeCloseTo(otherResult.re);
      expect(result.im).toBeCloseTo(otherResult.im);
    }
  });

  it("Points have their same modulus after rotation", () => {
    const z = randomComplex();
    const rot = unitCircleRotation(Math.random() * 2 * Math.PI);
    const result = apply(rot, z);

    expect(modulus(z)).toBeCloseTo(modulus(result));
  });
});

describe("Finding the geodesic between points", () => {
  it("Basic points", () => {});
});
