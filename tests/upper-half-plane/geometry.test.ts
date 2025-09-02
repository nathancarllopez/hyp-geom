import { describe, expect, it } from "vitest";
import {
  geodesicBetweenPoints,
  uhpDistance,
  I,
  toUhpPoint,
  UhpINFINITY,
  circleCenterAndRadius,
  toUhpInteriorPoint,
  circleCenterAndBdryPoint,
  horocyleGivenCenter,
  horocycleGivenBaseAndBdry,
  ZERO,
  toPointAtInfinity,
  toUhpBoundaryPoint,
} from "../../src/upper-half-plane/geometry";
import {
  randomComplex,
  randomReal,
  randomUhpBoundaryPoint,
  randomUhpInteriorPoint,
} from "../helpers/random";
import { ComplexNumber, UhpPoint } from "../../src/types-validators/types";

describe("Upper Half Plane factory function", () => {
  it("accept valid inputs", () => {
    const functionsAndInputs: {
      func: Function;
      inputs: ComplexNumber[];
    }[] = [
      {
        func: toPointAtInfinity,
        inputs: [
          { re: Infinity, im: randomReal() },
          { re: randomReal(), im: Infinity },
          { re: Infinity, im: Infinity },
        ],
      },
      {
        func: toUhpBoundaryPoint,
        inputs: [
          { re: randomReal(1e5, true), im: 0 }, // Positive real part
          { re: -randomReal(1e5, true), im: 0 }, // Negative real part
        ],
      },
      {
        func: toUhpInteriorPoint,
        inputs: [
          { re: randomReal(1e5, true), im: randomReal(1e5, true) },
          { re: -randomReal(1e5, true), im: randomReal(1e5, true) },
        ],
      },
      {
        func: toUhpPoint,
        inputs: [
          { re: Infinity, im: randomReal() },
          { re: randomReal(), im: Infinity },
          { re: Infinity, im: Infinity },
          { re: randomReal(1e5, true), im: 0 },
          { re: -randomReal(1e5, true), im: 0 },
          { re: randomReal(1e5, true), im: randomReal(1e5, true) },
          { re: -randomReal(1e5, true), im: randomReal(1e5, true) }
        ]
      }
    ];

    for (const test of functionsAndInputs) {
      const { func, inputs } = test;
      for (const input of inputs) {
        expect(() => func(input.re, input.im)).not.toThrow();
      }
    }
  });

  it("reject invalid inputs", () => {
    const functionsAndInputs: {
      func: Function;
      inputs: ComplexNumber[];
    }[] = [
      {
        func: toPointAtInfinity,
        inputs: [
          { re: 0, im: 0 },
          { re: 15, im: -3 },
          { re: randomReal(), im: randomReal() },
        ],
      },
      {
        func: toUhpBoundaryPoint,
        inputs: [
          { re: Infinity, im: 0 },
          { re: 3, im: Infinity },
          { re: randomReal(), im: randomReal(1e5, true) },
          { re: randomReal(), im: -randomReal(1e5, true) },
        ],
      },
      {
        func: toUhpInteriorPoint,
        inputs: [
          { re: Infinity, im: 2 },
          { re: 3, im: Infinity },
          { re: Math.E, im: -randomReal(1e5, true) },
          { re: Math.PI, im: 0 }
        ],
      },
      {
        func: toUhpPoint,
        inputs: [
          { re: randomReal(), im: -randomReal(1e5, true) },
        ]
      }
    ];

    for (const test of functionsAndInputs) {
      const { func, inputs } = test;
      for (const input of inputs) {
        expect(() => func(input.re, input.im)).toThrow();
      }
    }
  });

  it("accept random inputs", () => {
    for (let i = 0; i < 10; i++) {
      const z = randomComplex();

      if (z.im < 0) {
        expect(() => toUhpBoundaryPoint(z.re, z.im)).toThrow();
        expect(() => toUhpInteriorPoint(z.re, z.im)).toThrow();
        expect(() => toUhpPoint(z.re, z.im)).toThrow();
      } else if (z.im === 0) {
        expect(() => toUhpBoundaryPoint(z.re, z.im)).not.toThrow();
        expect(() => toUhpInteriorPoint(z.re, z.im)).toThrow();
        expect(() => toUhpPoint(z.re, z.im)).not.toThrow();
      } else {
        expect(() => toUhpBoundaryPoint(z.re, z.im)).toThrow();
        expect(() => toUhpInteriorPoint(z.re, z.im)).not.toThrow();
        expect(() => toUhpPoint(z.re, z.im)).not.toThrow();
      }

      expect(() => toPointAtInfinity(z.re, z.im)).toThrow();
    }
  });
});

describe("Hyperbolic distance formula", () => {
  it("distance between i and e * i is 1", () => {
    const eI = toUhpPoint(0, Math.E);
    const result = uhpDistance(I, eI);

    expect(result).toBeCloseTo(1);
  });

  it("distance between a point and itself is zero", () => {
    const z = randomUhpInteriorPoint();
    const result = uhpDistance(z, z);

    expect(result).toBe(0);
  });

  it("distance is always nonnegative", () => {
    const z = randomUhpInteriorPoint();
    const w = randomUhpInteriorPoint();
    const result = uhpDistance(z, w);

    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("distance between points is the same regardless of input order", () => {
    const z = randomUhpInteriorPoint();
    const w = randomUhpInteriorPoint();

    const result1 = uhpDistance(z, w);
    const result2 = uhpDistance(w, z);

    expect(result1).toBeCloseTo(result2);
  });

  it("distance between points on a vertical line is (the absolute value of) the natural log of the ratio of their imaginary parts", () => {
    const z = randomUhpInteriorPoint();
    const randIm = Math.random() * z.im;
    const below = toUhpPoint(z.re, randIm);

    const result = uhpDistance(z, below);
    const manualCalc = Math.log(z.im / randIm); // We don't have to include the absolute value since z.im > randIm

    expect(result).toBeCloseTo(manualCalc);
  });
});

describe("Geodesic between two points", () => {
  it("throws error with a negative tolerance", () => {
    const z = toUhpPoint(1, 1);
    const w = toUhpPoint(2, 2);
    const negTolerance = -1e3 * Math.random();

    expect(() => geodesicBetweenPoints(z, w, negTolerance)).toThrow(
      "Tolerance needs to be positive"
    );
  });

  it("throws error when the points are the same", () => {
    const z = randomUhpInteriorPoint();

    expect(() => geodesicBetweenPoints(z, z)).toThrow(
      "Input points must be distinct"
    );
  });

  it("geodesic connecting 1 + i and -1 + i", () => {
    const z = toUhpPoint(-1, 1);
    const w = toUhpPoint(1, 1);
    const expectedPoints = [
      { re: -Math.sqrt(2), im: 0 },
      z,
      w,
      { re: Math.sqrt(2), im: 0 },
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(z, w);

    expect(isVertical).toBe(false);
    expect(center.re).toBe(0);
    expect(center.im).toBe(0);
    expect(radius).toBeCloseTo(Math.sqrt(2));

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("geodesic connecting i and 2 + sqrt(5) * i", () => {
    const z = toUhpPoint(2, Math.sqrt(5));
    const expectedPoints = [
      { re: 2 - Math.sqrt(5), im: 0 },
      I,
      z,
      { re: 2 + Math.sqrt(5), im: 0 },
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(I, z);

    expect(isVertical).toBe(false);
    expect(center.re).toBe(2);
    expect(center.im).toBe(0);
    expect(radius).toBe(Math.sqrt(5));

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("random vertical geodesic", () => {
    const z = randomUhpInteriorPoint();
    const w = toUhpPoint(z.re, z.im + 1);
    const expectedPoints = [{ re: z.re, im: 0 }, z, w, UhpINFINITY];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(z, w);

    expect(isVertical).toBe(true);
    expect(center.re).toBe(Infinity);
    expect(center.im).toBe(Infinity);
    expect(radius).toBe(Infinity);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("one point is at infinity and the other is in the upper half plane", () => {
    const z = randomUhpInteriorPoint();
    const expectedPoints = [
      { re: z.re, im: 0 },
      { re: z.re, im: z.im / 2 },
      z,
      UhpINFINITY,
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(
      z,
      UhpINFINITY
    );

    expect(isVertical).toBe(true);
    expect(center.re).toBe(Infinity);
    expect(center.im).toBe(Infinity);
    expect(radius).toBe(Infinity);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("one point is at infinity and the other is on the real axis", () => {
    const z = randomUhpBoundaryPoint();
    const expectedPoints = [
      z,
      { re: z.re, im: 1 },
      { re: z.re, im: 2 },
      UhpINFINITY,
    ];

    const { isVertical, center, radius, points } = geodesicBetweenPoints(
      z,
      UhpINFINITY
    );

    expect(isVertical).toBe(true);
    expect(center.re).toBe(Infinity);
    expect(center.im).toBe(Infinity);
    expect(radius).toBe(Infinity);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("Both points are on the real axis", () => {
    const z = randomUhpBoundaryPoint();
    const w = randomUhpBoundaryPoint();

    const expectedCenter = { re: (z.re + w.re) / 2, im: 0 };
    const expectedRadius = Math.abs(z.re - w.re) / 2;
    const expectedPoints: UhpPoint[] = [z];

    const oneQuarter = toUhpPoint(
      expectedRadius * Math.cos(0.25 * Math.PI) - expectedCenter.re,
      expectedRadius * Math.sin(0.25 * Math.PI)
    );
    const threeQuarter = toUhpPoint(
      expectedRadius * Math.cos(0.75 * Math.PI) - expectedCenter.re,
      expectedRadius * Math.sin(0.75 * Math.PI)
    );

    if (z.re < w.re) {
      expectedPoints.push(threeQuarter, oneQuarter, w);
    } else {
      expectedPoints.push(oneQuarter, threeQuarter, w);
    }

    const { isVertical, center, radius, points } = geodesicBetweenPoints(z, w);

    expect(isVertical).toBe(false);
    expect(center.re).toBe(expectedCenter.re);
    expect(center.im).toBe(expectedCenter.im);
    expect(radius).toBe(expectedRadius);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const expected = expectedPoints[i];

      expect(point.re).toBeCloseTo(expected.re);
      expect(point.im).toBeCloseTo(expected.im);
    }
  });

  it("Swapping the order of the inputs preserves all info except reverses the order of the returned points", () => {
    const z = randomUhpInteriorPoint();
    const w = randomUhpInteriorPoint();

    const zwGeodesic = geodesicBetweenPoints(z, w);
    const wzGeodesic = geodesicBetweenPoints(w, z);

    expect(zwGeodesic.isVertical).toBe(wzGeodesic.isVertical);
    expect(zwGeodesic.center.re).toBeCloseTo(wzGeodesic.center.re);
    expect(zwGeodesic.center.im).toBeCloseTo(wzGeodesic.center.im);
    expect(zwGeodesic.radius).toBeCloseTo(wzGeodesic.radius);

    const zwPoints = zwGeodesic.points;
    const wzPoints = wzGeodesic.points;

    for (let i = 0; i < zwPoints.length; i++) {
      const zwPoint = zwPoints[i];
      const wzPoint = wzPoints[wzPoints.length - 1 - i];

      expect(zwPoint.re).toBeCloseTo(wzPoint.re);
      expect(zwPoint.im).toBeCloseTo(wzPoint.im);
    }
  });
});

describe("Hyperbolic circle from center and radius", () => {
  it("center at i with radius 1", () => {
    const { center, radius, eucCenter, eucRadius } = circleCenterAndRadius(
      I,
      1
    );

    expect(center).toEqual(I);
    expect(radius).toBe(1);
    expect(eucCenter.re).toBe(0);
    expect(eucCenter.im).toBe(Math.cosh(1));
    expect(eucRadius).toBe(Math.sinh(1));
  });

  it("random center with random radius", () => {
    const randCenter = randomUhpInteriorPoint();
    const randRadius = 10 * Math.random();

    const { center, radius, eucCenter, eucRadius } = circleCenterAndRadius(
      randCenter,
      randRadius
    );

    expect(center).toEqual(randCenter);
    expect(radius).toBe(randRadius);
    expect(eucCenter.re).toBe(randCenter.re);
    expect(eucCenter.im).toBeCloseTo(randCenter.im * Math.cosh(radius));
    expect(eucRadius).toBeCloseTo(randCenter.im * Math.sinh(radius));
  });

  it("circle is always fully contained in the interior", () => {
    // We choose a small upper bound so circles are chosen near the boundary
    const randCenter = randomUhpInteriorPoint(10);
    const randRadius = 10 * Math.random();

    const { eucCenter, eucRadius } = circleCenterAndRadius(
      randCenter,
      randRadius
    );
    const imLowestBdryPoint =
      eucRadius * Math.sin(1.5 * Math.PI) + eucCenter.im;

    expect(imLowestBdryPoint).toBeGreaterThan(0);
  });

  it("randomly chosen point on circle is the correct distance from the center", () => {
    const randCenter = randomUhpInteriorPoint();
    const randRadius = 10 * Math.random();
    const { eucCenter, eucRadius } = circleCenterAndRadius(
      randCenter,
      randRadius
    );

    const randTheta = Math.random() * 2 * Math.PI;
    const pointOnCircle = toUhpPoint(
      eucRadius * Math.cos(randTheta) + eucCenter.re,
      eucRadius * Math.sin(randTheta) + eucCenter.im
    );
    const distance = uhpDistance(randCenter, pointOnCircle);

    expect(distance).toBeCloseTo(randRadius);
  });
});

describe("Hyperbolic circle from center and boundary point", () => {
  it("center at i with boundary point e*i", () => {
    const { center, radius, eucCenter, eucRadius } = circleCenterAndBdryPoint(
      I,
      toUhpInteriorPoint(0, Math.E)
    );

    expect(center).toEqual(I);
    expect(radius).toBeCloseTo(1);
    expect(eucCenter.re).toBe(0);
    expect(eucCenter.im).toBeCloseTo(Math.cosh(1));
    expect(eucRadius).toBeCloseTo(Math.sinh(1));
  });

  it("circle is always fully contained in the interior", () => {
    // We choose a small upper bound so circles are chosen near the boundary
    const randCenter = randomUhpInteriorPoint(10);
    const randomBdryPoint = randomUhpInteriorPoint();

    const { eucCenter, eucRadius } = circleCenterAndBdryPoint(
      randCenter,
      randomBdryPoint
    );
    const imLowestBdryPoint =
      eucRadius * Math.sin(1.5 * Math.PI) + eucCenter.im;

    expect(imLowestBdryPoint).toBeGreaterThan(0);
  });

  it("randomly chosen point on circle is the correct distance from the center", () => {
    const randCenter = randomUhpInteriorPoint();
    const randomBdryPoint = randomUhpInteriorPoint();
    const { radius, eucCenter, eucRadius } = circleCenterAndBdryPoint(
      randCenter,
      randomBdryPoint
    );

    const theta = Math.random() * 2 * Math.PI;
    const pointOnCircle = toUhpPoint(
      eucRadius * Math.cos(theta) + eucCenter.re,
      eucRadius * Math.sin(theta) + eucCenter.im
    );
    const distance = uhpDistance(randCenter, pointOnCircle);

    expect(distance).toBeCloseTo(radius);
  });
});

describe("Horocycle given center", () => {
  it("center at i", () => {
    const twoI = toUhpInteriorPoint(0, 2);
    const { center, basePoint, bdryPoint, eucRadius } = horocyleGivenCenter(I);

    expect(center).toEqual(I);
    expect(basePoint).toEqual(ZERO);
    expect(bdryPoint).toEqual(twoI);
    expect(eucRadius).toBe(1);
  });

  it("center at point at infinity", () => {
    const { center, basePoint, bdryPoint, eucRadius } =
      horocyleGivenCenter(UhpINFINITY);

    expect(center).toEqual(UhpINFINITY);
    expect(basePoint).toEqual(UhpINFINITY);
    expect(bdryPoint).toEqual(I);
    expect(eucRadius).toBe(Infinity);
  });

  it("random center", () => {
    const randCenter = randomUhpInteriorPoint();

    const { center, basePoint, bdryPoint, eucRadius } =
      horocyleGivenCenter(randCenter);

    expect(center).toEqual(randCenter);
    expect(basePoint).toEqual({ re: randCenter.re, im: 0 });
    expect(bdryPoint).toEqual(
      toUhpInteriorPoint(randCenter.re, 2 * randCenter.im)
    );
    expect(eucRadius).toBe(randCenter.im);
  });
});

describe("Horocycle given base and boundary points", () => {
  it("base point at 0, boundary point at 2*i", () => {
    const twoI = toUhpInteriorPoint(0, 2);

    const { center, basePoint, bdryPoint, eucRadius } =
      horocycleGivenBaseAndBdry(ZERO, twoI);

    expect(center).toEqual(I);
    expect(basePoint).toEqual(ZERO);
    expect(bdryPoint).toEqual(twoI);
    expect(eucRadius).toBe(1);
  });

  it("base at 0, boundary point at (1+i)*k for random k", () => {
    const randScale = randomReal(1e5, true);
    const randBdry = toUhpInteriorPoint(randScale, randScale);
    const expectedCenter = toUhpInteriorPoint(0, randScale);

    const { center, basePoint, bdryPoint, eucRadius } =
      horocycleGivenBaseAndBdry(ZERO, randBdry);

    expect(center).toEqual(expectedCenter);
    expect(basePoint).toEqual(ZERO);
    expect(bdryPoint).toEqual(randBdry);
    expect(eucRadius).toBe(randScale);
  });

  it("base point at infinity, boundary point at i", () => {
    const { center, basePoint, bdryPoint, eucRadius } =
      horocycleGivenBaseAndBdry(UhpINFINITY, I);

    expect(center).toEqual(UhpINFINITY);
    expect(basePoint).toEqual(UhpINFINITY);
    expect(bdryPoint).toEqual(I);
    expect(eucRadius).toBe(Infinity);
  });

  it("base point at infinity, random boundary point", () => {
    const randBdry = randomUhpInteriorPoint();

    const { center, basePoint, bdryPoint, eucRadius } =
      horocycleGivenBaseAndBdry(UhpINFINITY, randBdry);

    expect(center).toEqual(UhpINFINITY);
    expect(basePoint).toEqual(UhpINFINITY);
    expect(bdryPoint).toEqual(randBdry);
    expect(eucRadius).toBe(Infinity);
  });
});
