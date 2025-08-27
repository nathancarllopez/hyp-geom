import { describe, expect, it } from "vitest";
import {
  scale,
  add,
  complex,
  modulus,
  multiply,
  conjugate,
  inverse,
  divide,
  ZERO,
  I,
  ONE,
} from "../src/complex-numbers";
import { randomComplex, randomNonZeroComplex } from "./helpers/random";

describe("Modulus of a complex number", () => {
  it("Basic modulus", () => {
    const z = complex(1, 2);
    const result = modulus(z);

    expect(result).toBe(Math.sqrt(5));
  });

  it("modulus of zero is zero", () => {
    const result = modulus(ZERO);

    expect(result).toBe(0);
  });

  it("modulus of purely real number is absolute value", () => {
    const z = complex(-7, 0);
    const result = modulus(z);

    expect(result).toBe(7);
  });

  it("modulus of purely imaginary number is absolute value", () => {
    const z = complex(0, -5);
    const result = modulus(z);

    expect(result).toBe(5);
  });

  it("modulus is always non-negative", () => {
    for (let i = 0; i < 10; i++) {
      const z = randomComplex();

      expect(modulus(z)).toBeGreaterThanOrEqual(0);
    }
  });

  it("modulus of conjugate equals modulus", () => {
    const z = randomComplex();
    const conj = conjugate(z);

    expect(modulus(z)).toBeCloseTo(modulus(conj));
  });

  it("modulus of product equals product of moduli", () => {
    const z = randomComplex();
    const w = randomComplex();

    const modProduct = modulus(multiply(z, w));
    const productOfMods = modulus(z) * modulus(w);

    expect(modProduct).toBeCloseTo(productOfMods, 1);
  });
});

describe("Scaling complex numbers", () => {
  it("scaling by 1 yields the same number", () => {
    const z = randomComplex();
    const result = scale(z, 1);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("scaling by 0 yields zero", () => {
    const z = randomComplex();
    const result = scale(z, 0);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });

  it("scaling by a positive real number", () => {
    const z = complex(2, -3);
    const lambda = 4;
    const result = scale(z, lambda);

    expect(result.re).toBeCloseTo(8);
    expect(result.im).toBeCloseTo(-12);
  });

  it("scaling by a negative real number", () => {
    const z = complex(1, 5);
    const lambda = -2;
    const result = scale(z, lambda);

    expect(result.re).toBeCloseTo(-2);
    expect(result.im).toBeCloseTo(-10);
  });

  it("scaling zero yields zero", () => {
    const z = complex(0, 0);
    const result = scale(z, 5);

    expect(result.re).toBe(0);
    expect(result.im).toBe(0);
  });

  it("scaling is distributive over addition", () => {
    const z = randomComplex();
    const w = randomComplex();
    const lambda = Math.random() * 10 - 5;

    const left = scale(add(z, w), lambda);
    const right = add(scale(z, lambda), scale(w, lambda));

    expect(left.re).toBeCloseTo(right.re);
    expect(left.im).toBeCloseTo(right.im);
  });

  it("scaling is associative", () => {
    const z = randomComplex();
    const a = Math.random() * 10 - 5;
    const b = Math.random() * 10 - 5;

    const left = scale(scale(z, a), b);
    const right = scale(z, a * b);

    expect(left.re).toBeCloseTo(right.re);
    expect(left.im).toBeCloseTo(right.im);
  });
});

describe("Conjugate of a complex number", () => {
  it("Basic conjugate", () => {
    const z = complex(2, 8);
    const result = conjugate(z);

    expect(result.re).toBe(2);
    expect(result.im).toBe(-8);
  });

  it("conjugate of purely real number is itself", () => {
    const z = complex(5, 0);
    const result = conjugate(z);
    
    expect(result.re).toBe(5);
    expect(result.im).toBe(0);
  });

  it("conjugate of purely imaginary number negates imaginary part", () => {
    const z = complex(0, 7);
    const result = conjugate(z);

    expect(result.re).toBe(0);
    expect(result.im).toBe(-7);
  });

  it("conjugate of zero is zero", () => {
    const result = conjugate(ZERO);

    expect(result.re).toBe(0);
    expect(result.im).toBe(0);
  });

  it("conjugate of conjugate returns original", () => {
    const z = randomComplex();
    const conj = conjugate(z);
    const conjConj = conjugate(conj);

    expect(conjConj.re).toBeCloseTo(z.re);
    expect(conjConj.im).toBeCloseTo(z.im);
  });

  it("conjugate distributes over addition", () => {
    const z = randomComplex();
    const w = randomComplex();

    const conjSum = conjugate(add(z, w));
    const sumConj = add(conjugate(z), conjugate(w))

    expect(conjSum.re).toBeCloseTo(sumConj.re);
    expect(conjSum.im).toBeCloseTo(sumConj.im);
  });

  it("conjugate distributes over multiplication", () => {
    const z = randomComplex();
    const w = randomComplex();

    const conjProduct = conjugate(multiply(z, w));
    const productConj = multiply(conjugate(z), conjugate(w));
    
    expect(conjProduct.re).toBeCloseTo(productConj.re);
    expect(conjProduct.im).toBeCloseTo(productConj.im);
  });

  it("conjugate negates only the imaginary part", () => {
    const z = randomComplex();
    const result = conjugate(z);

    expect(result.re).toBe(z.re);
    expect(result.im).toBe(-z.im);
  });
});

describe("Adding complex numbers", () => {
  it("basic addition", () => {
    const z = complex(1, 2);
    const w = complex(3, 4);
    const result = add(z, w);

    expect(result.re).toBe(4);
    expect(result.im).toBe(6);
  });

  it("random addition", () => {
    const z = randomComplex();
    const w = randomComplex();
    const result = add(z, w);

    expect(result.re).toBeCloseTo(z.re + w.re);
    expect(result.im).toBeCloseTo(z.im + w.im);
  });

  it("adding zero gives the same result", () => {
    const z = randomComplex();
    const zero = complex(0, 0);
    const result = add(z, zero);

    expect(result.re).toBe(z.re);
    expect(result.im).toBe(z.im);
  });

  it("addition is commutative", () => {
    const z = randomComplex();
    const w = randomComplex();

    const result1 = add(z, w);
    const result2 = add(w, z);

    expect(result1.re).toBeCloseTo(result2.re);
    expect(result1.im).toBeCloseTo(result2.im);
  });

  it("addition is associative", () => {
    const z = randomComplex();
    const w = randomComplex();
    const u = randomComplex();

    const result1 = add(add(z, w), u);
    const result2 = add(z, add(w, u));

    expect(result1.re).toBeCloseTo(result2.re);
    expect(result1.im).toBeCloseTo(result2.im);
  });

  it("adding negatives yields zero", () => {
    const z = randomComplex();
    const negZ = scale(z, -1);
    const result = add(z, negZ);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });

  it("adding purely real numbers", () => {
    const z = complex(5, 0);
    const w = complex(-3, 0);

    const result = add(z, w);

    expect(result.re).toBe(2);
    expect(result.im).toBe(0);
  });

  it("adding purely imaginary numbers", () => {
    const z = complex(0, 7);
    const w = complex(0, -2);

    const result = add(z, w);

    expect(result.re).toBe(0);
    expect(result.im).toBe(5);
  });
});

describe("Multiplying complex numbers", () => {
  it("basic multiplication", () => {
    const z = complex(1, 2);
    const w = complex(3, 4);
    const result = multiply(z, w);

    expect(result.re).toBe(-5);
    expect(result.im).toBe(10);
  });

  it("multiplying i by itself gives negative one", () => {
    const result = multiply(I, I);

    expect(result.re).toBe(-1);
    expect(result.im).toBe(0);
  });

  it("multiplying by zero yields zero", () => {
    const z = randomComplex();

    const result = multiply(z, ZERO);

    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });

  it("multiplying by one yields the same number", () => {
    const z = randomComplex();
    const result = multiply(z, ONE);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("multiplying by i rotates by 90 degrees", () => {
    const z = complex(2, 3);
    const result = multiply(z, I);

    expect(result.re).toBeCloseTo(-3);
    expect(result.im).toBeCloseTo(2);
  });

  it("multiplication is commutative", () => {
    const z = randomComplex();
    const w = randomComplex();

    const result1 = multiply(z, w);
    const result2 = multiply(w, z);

    expect(result1.re).toBeCloseTo(result2.re);
    expect(result1.im).toBeCloseTo(result2.im);
  });

  it("multiplication is distributive over addition", () => {
    const z = randomComplex();
    const w = randomComplex();
    const u = randomComplex();

    const left = multiply(z, add(w, u));
    const right = add(multiply(z, w), multiply(z, u));

    expect(left.re).toBeCloseTo(right.re);
    expect(left.im).toBeCloseTo(right.im);
  });

  it("multiplying conjugates yields modulus squared", () => {
    const z = randomComplex();
    const modSqrd = modulus(z) ** 2;
    const result = multiply(z, conjugate(z));

    expect(result.im).toBeCloseTo(0);
    expect(result.re).toBeCloseTo(modSqrd);
  });

  it("multiplying purely imaginary numbers", () => {
    const z = complex(0, 2);
    const w = complex(0, 3);
    const result = multiply(z, w);

    expect(result.re).toBeCloseTo(-6);
    expect(result.im).toBeCloseTo(0);
  });
});

describe("Inverse of complex numbers", () => {
  it("inverse of 1 + 0i is 1 - 0i", () => {
    const inv = inverse(ONE);

    expect(inv.re).toBeCloseTo(1);
    expect(inv.im).toBeCloseTo(0);
  });

  it("inverse of 0 + 1i is 0 - 1i", () => {
    const inv = inverse(I);

    expect(inv.re).toBeCloseTo(0);
    expect(inv.im).toBeCloseTo(-1);
  });

  it("inverse of purely real number", () => {
    const z = complex(2, 0);
    const inv = inverse(z);

    expect(inv.re).toBeCloseTo(0.5);
    expect(inv.im).toBeCloseTo(0);
  });

  it("inverse of purely imaginary number", () => {
    const z = complex(0, 4);
    const inv = inverse(z);

    expect(inv.re).toBeCloseTo(0);
    expect(inv.im).toBeCloseTo(-0.25);
  });

  it("inverse of random (non-zero) complex number", () => {
    const z = randomNonZeroComplex();
    const inv = inverse(z);

    const prod = multiply(z, inv);

    expect(prod.re).toBeCloseTo(1);
    expect(prod.im).toBeCloseTo(0);
  });

  it("inverse of conjugate is conjugate of inverse", () => {
    const z = randomComplex();

    const invConj = inverse(conjugate(z));
    const conjInv = conjugate(inverse(z));

    expect(invConj.re).toBeCloseTo(conjInv.re);
    expect(invConj.im).toBeCloseTo(conjInv.im);
  });
});

describe("Division of complex numbers", () => {
  it("basic division", () => {
    const z = complex(4, 2);
    const w = complex(1, -1);
    const result = divide(z, w);

    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(3);
  });

  it("division by one yields the same number", () => {
    const z = randomComplex();
    const result = divide(z, ONE);

    expect(result.re).toBeCloseTo(z.re);
    expect(result.im).toBeCloseTo(z.im);
  });

  it("zero divided by any (non-zero) number is zero", () => {
    const z = randomNonZeroComplex();
    const result = divide(ZERO, z);
    
    expect(result.re).toBeCloseTo(0);
    expect(result.im).toBeCloseTo(0);
  });

  it("any number divided by itself is one (except zero)", () => {
    const z = randomNonZeroComplex();
    const result = divide(z, z);

    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(0);
  });

  it("division of purely real numbers", () => {
    const z = complex(6, 0);
    const w = complex(2, 0);
    const result = divide(z, w);

    expect(result.re).toBeCloseTo(3);
    expect(result.im).toBeCloseTo(0);
  });

  it("division of purely imaginary numbers", () => {
    const z = complex(0, 6);
    const w = complex(0, 2);
    const result = divide(z, w);

    expect(result.re).toBeCloseTo(3);
    expect(result.im).toBeCloseTo(0);
  });

  it("division by i rotates by -90 degrees", () => {
    const z = complex(2, 3);
    const i = complex(0, 1);
    const result = divide(z, i);

    expect(result.re).toBeCloseTo(3);
    expect(result.im).toBeCloseTo(-2);
  });

  it("division result multiplied by divisor returns dividend (except zero)", () => {
    const z = randomComplex();
    const w = randomNonZeroComplex();

    const quotient = divide(z, w);
    const product = multiply(quotient, w);
      
    expect(product.re).toBeCloseTo(z.re);
    expect(product.im).toBeCloseTo(z.im);
  });

  it("division result is correct for negative numbers", () => {
    const z = complex(-4, -2);
    const w = complex(-1, 1);
    const result = divide(z, w);

    expect(result.re).toBeCloseTo(1);
    expect(result.im).toBeCloseTo(3);
  });

  it("division is not commutative", () => {
    const z = complex(5, 2);
    const w = complex(1, 3);

    const result1 = divide(z, w);
    const result2 = divide(w, z);

    // They should not be equal
    expect(result1.re).not.toBeCloseTo(result2.re);
    expect(result1.im).not.toBeCloseTo(result2.im);
  });
});
