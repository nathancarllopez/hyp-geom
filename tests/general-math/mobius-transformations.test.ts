import { describe, expect, it } from "vitest";
import { MobiusTransformation } from "../../src/general-math/mobius-transformations";
import { add, argument, divide, I, modulus, multiply, ONE, toComplex, ZERO } from "../../src/general-math/complex-numbers";
import { randomComplex, randomMobius, randomNonZeroComplex, randomReal } from "../helpers/random";

describe("Class constructor", () => {
  it("Returns the identity with no inputs", () => {
    const m = new MobiusTransformation();
    const coeffs = [ONE, ZERO, ZERO, ONE];

    expect(m.coeffs).toEqual(coeffs);
  });

  it("Accepts random inputs", () => {
    const a = randomComplex();
    const b = randomComplex();
    const c = randomComplex();
    // Ensure at least one of c or d is nonzero
    const d = randomNonZeroComplex();

    const m = new MobiusTransformation(a, b, c, d);
    const coeffs = [a, b, c, d];

    expect(m.coeffs).toEqual(coeffs);
  });

  it("Throws if last two inputs are both zero", () => {
    const a = randomComplex();
    const b = randomComplex();
    expect(() => new MobiusTransformation(a, b, ZERO, ZERO)).toThrow("Denominator of mobius transformation cannot be zero");
  });
});

describe("Static mobius transformations", () => {
  const unitCircleRotation = (theta: number) =>
    MobiusTransformation.unitCircleRotation(theta);

  it("unit circle rotation sends one to i when theta is pi / 2", () => {
    const quarterRot = unitCircleRotation(Math.PI / 2);
    const result = quarterRot.apply(ONE);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(1);
  });

  it("unit circle rotation sends random point to the correct image", () => {
    const z = randomNonZeroComplex();
    const theta = randomReal(2 * Math.PI);

    const radius = modulus(z);
    const arg = argument(z);
    const expectedResult = toComplex(
      radius * Math.cos(arg + theta),
      radius * Math.sin(arg + theta)
    );

    const result = unitCircleRotation(theta).apply(z);
    expect(result.re).toBeCloseTo(expectedResult.re);
    expect(result.im).toBeCloseTo(expectedResult.im);
  });

  it("unit circle rotation preserves modulus", () => {
    const z = randomNonZeroComplex();
    const theta = randomReal(2 * Math.PI);
    const mod = modulus(z);

    const resultMod = modulus(unitCircleRotation(theta).apply(z));

    expect(resultMod).toBeCloseTo(mod);
  })

  const cayley = MobiusTransformation.cayley();

  it("The cayley transform sends i to zero and zero to negative one", () => {
    const iResult = cayley.apply(I)
    const zeroResult = cayley.apply(ZERO);

    expect(iResult).toEqual(ZERO);
    expect(zeroResult).toEqual({ re: -1, im: -0 });
  });

  it("The determinant of the cayley transformation is 2*i", () => {
    expect(cayley.determinant()).toEqual({ re: 0, im: 2 });
  });

  it("Conjugation by Cayley is equivalent to conjugateByCayley", () => {
    const m = randomMobius();
    const byMethod = m.conjugateByCayley();
    const byManual = m.conjugate(cayley);

    expect(byMethod.coeffs).toEqual(byManual.coeffs);
  });
});

describe("Applying Mobius transformations", () => {
  it("Basic applying", () => {
    const m = new MobiusTransformation(
      { re: 1, im: 0 },
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 },
    );
    const z = toComplex(5, 6);
    const denom = 19 ** 2 + 18 ** 2;
    const result = m.apply(z);

    expect(result.re).toBeCloseTo(241 / denom);
    expect(result.im).toBeCloseTo(-12 / denom);
  });

  it("The identity transformation fixes any point", () => {
    const z = randomNonZeroComplex();
    const points = [z, ZERO];
    const identity = new MobiusTransformation();

    for (const point of points) {
      const result = identity.apply(point);

      expect(result.re).toBeCloseTo(point.re);
      expect(result.im).toBeCloseTo(point.im);
    }
  });

  it("The zero transformation sends all points to zero", () => {
    const z = randomNonZeroComplex();
    const points = [z, ZERO];
    const zeroMap = new MobiusTransformation(ZERO, ZERO, ZERO, ONE);

    for (const point of points) {
      const result = zeroMap.apply(point);

      expect(result.re).toBeCloseTo(0);
      expect(result.im).toBeCloseTo(0);
    }
  })

  it("Any mobius (a,b,c,d) sends zero to b / d", () => {
    const m = randomMobius();
    const [, b, , d] = m.coeffs 

    const applyResult = m.apply(ZERO);
    const divideResult = divide(b, d);

    expect(applyResult.re).toBeCloseTo(divideResult.re);
    expect(applyResult.im).toBeCloseTo(divideResult.im);
  });

  it("Any mobius (a,b,c,d) sends one to (a + b) / (c + d)", () => {
    const m = randomMobius();
    const [a, b, c, d] = m.coeffs;

    const applyResult = m.apply(ONE);
    const divideResult = divide(add(a, b), add(c, d));

    expect(applyResult.re).toBeCloseTo(divideResult.re);
    expect(applyResult.im).toBeCloseTo(divideResult.im);
  });

  it("Throws if denominator is zero", () => {
    const m = new MobiusTransformation(ONE, ONE, ONE, ZERO);

    expect(() => m.apply(ZERO)).toThrow(
      "Denominator is zero in Mobius transformation application",
    );
  });

  it("Handles purely imaginary numbers", () => {
    const m = new MobiusTransformation(
      { re: 0, im: 2 },
      { re: 0, im: 3 },
      { re: 0, im: 4 },
      { re: 0, im: 5 },
    );
    const result = m.apply(I);

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Handles negative values", () => {
    const m = new MobiusTransformation(
      { re: -1, im: 0 },
      { re: -2, im: 0 },
      { re: -3, im: 0 },
      { re: -4, im: 0 },
    );
    const z = { re: -5, im: 0 };
    const result = m.apply(z);

    expect(result.re).toBeCloseTo(3 / 11);
    expect(result.im).toBeCloseTo(0);
  });

  it("Handles large values without overflow", () => {
    const m = new MobiusTransformation(
      { re: 1e10, im: 0 },
      { re: 2e10, im: 0 },
      { re: 3e10, im: 0 },
      { re: 4e10, im: 0 },
    );
    const z = { re: 5e10, im: 0 };
    const result = m.apply(z)

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Handles zero transformation (all zeros except d)", () => {
    const m = new MobiusTransformation(ZERO, ZERO, ZERO, ONE);
    const z = randomComplex();
    const result = m.apply(z);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });
});

describe("Composition of Mobius transformations", () => {
  it("basic composition", () => {
    const m1 = new MobiusTransformation(
      { re: 1, im: 0 },
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 }
    );
    const m2 = new MobiusTransformation(
      { re: 0, im: 1 },
      { re: 0, im: 2 },
      { re: 0, im: 3 },
      { re: 0, im: 4 }
    );
    const coeffs = [
      { re: 0, im: 7 },
      { re: 0, im: 10 },
      { re: 0, im: 15 },
      { re: 0, im: 22 }
    ];

    const result = m1.compose(m2, false);
    expect(result.coeffs).toEqual(coeffs);
  })
  
  it("Composing with identity returns the original", () => {
    const identity = new MobiusTransformation();
    const m = randomMobius();
    const comp1 = m.compose(identity);
    const comp2 = identity.compose(m);

    const z = randomComplex();
    const r1 = comp1.apply(z);
    const r2 = comp2.apply(z);
    const rOrig = m.apply(z);

    expect(r1.re).toBeCloseTo(rOrig.re);
    expect(r1.im).toBeCloseTo(rOrig.im);
    expect(r2.re).toBeCloseTo(rOrig.re);
    expect(r2.im).toBeCloseTo(rOrig.im);
  });

  it("Composition applies transformations in order", () => {
    const m1 = randomMobius();
    const m2 = randomMobius();
    const z = randomComplex();
    
    const r1 = m2.apply(m1.apply(z));
    const r2 = m2.compose(m1).apply(z);

    expect(r2.re).toBeCloseTo(r1.re);
    expect(r2.im).toBeCloseTo(r1.im);
  });
});

describe("Conjugation of mobius transformations", () => {
  it("Conjugating by identity returns the original transformation", () => {
    const m = randomMobius();
    const identity = new MobiusTransformation();
    const conjugated = m.conjugate(identity, true);

    expect(conjugated.coeffs).toEqual(m.reduce().coeffs);
  });

  it("Conjugating the identity by any transformation returns the identity", () => {
    const m = randomMobius();
    const identity = new MobiusTransformation();
    const conjugated = identity.conjugate(m);

    for (let i = 0; i < 10; i++) {
      const z = randomComplex();
      const w = conjugated.apply(z);

      expect(w.re).toBeCloseTo(z.re);
      expect(w.im).toBeCloseTo(z.im);
    }

    // for (let i = 0; i < conjugated.coeffs.length; i++) {
    //   const idCoeff = identity.coeffs[i];
    //   const conjCoeff = conjugated.coeffs[i];

    //   expect(idCoeff.re).toBeCloseTo(conjCoeff.re);
    //   expect(idCoeff.im).toBeCloseTo(conjCoeff.im);
    // }
  });

  it("Conjugating by a non-invertible transformation throws", () => {
    const m = randomMobius();
    // Non-invertible: determinant is zero
    const nonInvertible = new MobiusTransformation(ZERO, ZERO, ONE, ONE);
    expect(() => m.conjugate(nonInvertible)).toThrow("Cannot conjugate by a non-invertible transformation");
  });

  it("Conjugation acts as expected on application: n.inverse().compose(m.compose(n))", () => {
    const m = randomMobius();
    const n = randomMobius();
    const z = randomComplex();

    const conjugated = m.conjugate(n);
    const manual = n.inverse().compose(m.compose(n));
    const result1 = conjugated.apply(z);
    const result2 = manual.apply(z);

    expect(result1.re).toBeCloseTo(result2.re);
    expect(result1.im).toBeCloseTo(result2.im);
  });
});

describe("Determinant of a Mobius transformation", () => {
  it("Basic calculation", () => {
    const m = new MobiusTransformation(
      { re: 1, im: 0 },
      { re: 2, im: 0 },
      { re: 3, im: 0 },
      { re: 4, im: 0 },
    );
    const result = m.determinant();

    expect(result.re).toBe(-2);
    expect(result.im).toBe(0);
  });

  it("Determinant of the identity transformation is 1", () => {
    const result = new MobiusTransformation().determinant();

    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant is zero for singular transformation", () => {
    const m = new MobiusTransformation(ZERO, ZERO, ONE, ONE);

    const result = m.determinant();
    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with random Mobius transformation", () => {
    const m = randomMobius();
    const result = m.determinant();

    expect(Number.isFinite(result.re)).toBe(true);
    expect(Number.isFinite(result.im)).toBe(true);
  });

  it("Determinant with purely imaginary coefficients", () => {
    const m = new MobiusTransformation(
      { re: 0, im: 2 },
      { re: 0, im: 3 },
      { re: 0, im: 4 },
      { re: 0, im: 5 },
    );

    const result = m.determinant();
    expect(result.re).toBeCloseTo(2);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with negative values", () => {
    const m = new MobiusTransformation(
      { re: -1, im: 0 },
      { re: -2, im: 0 },
      { re: -3, im: 0 },
      { re: -4, im: 0 },
    );

    const result = m.determinant();
    expect(result.re).toBeCloseTo(-2);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant with large values", () => {
    const m = new MobiusTransformation(
      { re: 1e10, im: 0 },
      { re: 2e10, im: 0 },
      { re: 3e10, im: 0 },
      { re: 4e10, im: 0 },
    );

    const result = m.determinant();
    expect(result.re).toBeCloseTo(-2e20);
    expect(result.im).toBeCloseTo(0);
  });

  it("Determinant of product is product of the determinants", () => {
    const upperBound = 1;
    const m = randomMobius(upperBound);
    const n = randomMobius(upperBound);

    const mDet = m.determinant();
    const nDet = n.determinant();
    const prodOfDet = multiply(mDet, nDet);
    const detOfProd = m.compose(n).determinant();

    expect(prodOfDet.re).toBeCloseTo(detOfProd.re);
    expect(prodOfDet.im).toBeCloseTo(detOfProd.im);
  });
});

describe("Inverse of a Mobius transformation", () => {
  it("Inverse of the identity is the identity", () => {
    const identity = new MobiusTransformation();
    const inverse = identity.inverse();

    for (let i = 0; i < inverse.coeffs.length; i++) {
      const idCoeff = identity.coeffs[i];
      const invCoeff = inverse.coeffs[i];

      expect(idCoeff.re).toBeCloseTo(invCoeff.re);
      expect(idCoeff.im).toBeCloseTo(invCoeff.im);
    }
  });

  it("Inverse undoes the transformation", () => {
    const m = randomMobius();
    const mInv = m.inverse();

    const z = randomComplex();
    const w = m.apply(z);
    const zBack = mInv.apply(w);

    expect(zBack.re).toBeCloseTo(z.re);
    expect(zBack.im).toBeCloseTo(z.im);
  });

  it("Composition of inverses is identity", () => {
    const m = randomMobius();
    const mInv = m.inverse();
    const comp1 = m.compose(mInv);
    const comp2 = mInv.compose(m);

    for (let i = 0; i < 10; i++) {
      const z = randomComplex();
      const w1 = comp1.apply(z);
      const w2 = comp2.apply(z);

      expect(w1.re).toBeCloseTo(z.re);
      expect(w1.im).toBeCloseTo(z.im);
      expect(w2.re).toBeCloseTo(z.re);
      expect(w2.im).toBeCloseTo(z.im);
    }
  });
});