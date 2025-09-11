# API Reference

This document describes the public API of the `hyp-geom` library.

---

## Table of Contents

- [Constants](#constants)
- [Base Classes](#base-classes)
  - [ComplexNumber](#complexnumber)
  - [MöbiusTransformation](#Möbiustransformation)
- [UpperHalfPlane](#upperhalfplane)
  - [UHP Constructor](#uhp-constructor)
  - [UHP Types](#uhp-types)
  - [UHP Methods](#uhp-methods)
- [PoincareDisk](#poincaredisk)
  - [PD Constructor](#pd-constructor)
  - [PD Types](#pd-types)
  - [PD Methods](#pd-methods)

---

## Constants

```ts
STANDARD_RELATIVE_TOLERANCE: number = 1e-5;
STANDARD_ABSOLUTE_TOLERANCE: number = 1e-8;
```

Default tolerances for geometric computations. Many of the classes take these as optional parameters, and all that do will throw an error if they are not positive.

See the functions `nearlyEqual` and `anglesEquivalent` in src/util.ts to see how these values are used.

---

## Base Classes

These classes are extended by the exposed api

### ComplexNumber

Represents a complex number with relative/absolute tolerance checks.

#### Constructor

```ts
new ComplexNumber(
  re: number = 0,
  im: number = 0,
  rtol: number = 1e-5,
  atol: number = 1e-8,
)
```

- `re: number` – real part
- `im: number` – imaginary part
- `rtol`: relative tolerance
- `atol`: absolute tolerance

Throws if

- tolerances are not positive

#### Fields

- `re: number` – real part
- `im: number` – imaginary part
- `modulus: number` – Euclidean modulus √(re² + im²)
- `rtol: number`: relative tolerance
- `atol: number`: absolute tolerance

#### Key Methods

- `isEqualTo(w: ComplexNumber): boolean` – equality with tolerances
- `add`, `subtract`, `multiply`, `divide` – arithmetic operations
- `conjugate(): ComplexNumber` – reflection across the real axis
- `inverse(): ComplexNumber` – multiplicative inverse
- `scale(lambda: number): ComplexNumber` – scalar multiplication
- `eucDistance(w: ComplexNumber): number` – Euclidean distance
- `angleBetween(w: ComplexNumber): number` – angle (via dot product)
- `principalNthRoot(n: number): ComplexNumber` – principal root (default square root)
- `clone(): ComplexNumber` – deep copy

### MöbiusTransformation

Represents a Möbius transformation

z => (a*z + b) / (c*z + d)

determined by four complex coefficients a, b, c, and d.

### Constructor

```ts
new MöbiusTransformation(
  coeffs: ComplexNumber[],   // must be length 4: [a, b, c, d]
  rtol: number = 1e-5,
  atol: number = 1e-8
)
```

- `coeffs`: array of four `ComplexNumber` instances `[a, b, c, d]`
- `rtol`: relative tolerance (must be positive)
- `atol`: absolute tolerance (must be positive)

Throws if:

- The coefficients array length is not 4
- Both `c` and `d` are zero (invalid denominator)
- Tolerances are not positive

### Fields

- `coeffs`: coefficients array of type `ComplexNumber[]`
- `rtol: number`: relative tolerance
- `atol: number`: absolute tolerance

### Key Methods

- `isEqualTo(n: MöbiusTransformation): boolean`: Compares two transformations by testing their action on 1, 0, and i. A Möbius transformation is determined by its action on three points.
- `determinant(): ComplexNumber`: Returns ad - bc.
- `clone(): MöbiusTransformation`: Deep copy.
- `reduce(): MöbiusTransformation`: Normalizes coefficients so that determinant = 1, or returns the a clone if the given transformation is not invertible.
- `compose(n: MöbiusTransformation, doReduce = false): MöbiusTransformation`: Returns the composition this ∘ n.
- `conjugate(n: MöbiusTransformation, doReduce = false): MöbiusTransformation`: Returns n⁻¹ ∘ this ∘ n. Throws if n is non-invertible.
- `inverse(doReduce = false): MöbiusTransformation`: Returns the inverse transformation. Throws if determinant is zero.
- `apply(z: ComplexNumber): ComplexNumber`: Applies the transformation to a complex number, handling the point at infinity.

---

## UpperHalfPlane

Represents the hyperbolic plane in the upper half-plane (UHP) model. Provides methods for constructing points and curves, as well as isometries and their classifications.

---

### UHP Constructor

```ts
new UpperHalfPlane(
  rtol: number = STANDARD_RELATIVE_TOLERANCE,
  atol: number = STANDARD_ABSOLUTE_TOLERANCE
)
```

- `rtol`: relative tolerance
- `atol`: absolute tolerance

Throws if:

- Tolerances are not positive

---

### UHP Types

The following are used as parameters or are return values for some of the methods of UpperHalfPlane:

#### UhpPoint

A class representing a point in the Upper Half-Plane model, extending `ComplexNumber`.

**Fields**

- `type`: `"interior"` or `"boundary"` – point classification
- `subType?`: `"on-real-line"` or `"infinity"` – further classification if boundary
- **Interior points**: finite with `im > 0`
- **Boundary points**: on real axis (`im = 0`) or at infinity (`re = ∞`, `im = ∞`)

#### UhpGeodesic

```ts
type UhpGeodesic = {
  isVertical: boolean;
  center: UhpPoint;
  radius: number;
  points: UhpPoint[];
};
```

Represents a complete geodesic (vertical line or semicircle orthogonal to the real axis).

- `center`: A UhpPoint of type `interior` or, if isVertical is true, the point at infinity
- `readius`: Distance between center and any point on the geodesic, Infinity if isVertical

#### UhpGeodesicSegment

```ts
type UhpGeodesicSegment = UhpGeodesic & {
  intAngles: [number, number] | null;
  intHeights: [number, number] | null;
  length: number;
};
```

Represents a geodesic arc segment.

- `intAngles`: The angles of the interior points on the geodesic arc with respect to the center and radius. (null if isVertical is true)
- `intHeights`: The heights of the interior points on the geodesic when the geodesic is vertical (null if isVertical is false)
- `length`: The (possibly infinite) hyperbolic distance between the two ends of the segment

#### UhpCircle

```ts
type UhpCircle = {
  center: UhpPoint;
  radius: number;
  eucCenter: UhpPoint;
  eucRadius: number;
};
```

Represents a circle with hyperbolic center `center` and hyperbolic radius `radius`.

- `center`: The hyperbolic center of the circle (a UhpPoint).
- `radius`: The hyperbolic radius (distance from center to any point on the circle).
- `eucCenter`: The center of the circle as a Euclidean circle.
- `eucRadius`: The radius of the circle as a Euclidean circle.

#### UhpHorocycle

```ts
type UhpHorocycle = {
  basePoint: UhpPoint;
  onHorPoint: UhpPoint;
  center: UhpPoint;
  eucRadius: number;
};
```

Represents a horocycle, i.e., a circle tangent to the boundary of the hyperbolic plane at `basePoint` or a horizontal line if `basePoint` is infinite.

- `basePoint`: The point of tangency of the horocycle, possibly infinite.
- `onHorPoint`: A point on the horocycle.
- `center`: The (Euclidean) center of the horocycle if `basePoint` is not infinity, infinity otherwise.
- `eucRadius`: The (Euclidean) radius of the horocycle if `basePoint` is not infinity, infinity otherwise.

#### UhpPolygon

```ts
type UhpPolygon = {
  vertices: UhpPoint[];
  sides: UhpGeodesicSegment[];
  angles: number[];
  area: number;
  perimeter: number;
};
```

Represents a polygon made from geodesic segments.

- `vertices`: The vertices of the polygon
- `sides`: The segments that make up the boundary of the polygon
- `angles`: The internal angles of the polygon, in the same order as the `vertices`
- `area`: The hyperbolic area of the polygon
- `perimeter`: They hyperbolic perimeter of the polygon

#### UhpFixedPoints

```ts
type UhpFixedPoints =
  | [UhpPoint, UhpPoint] // hyperbolic
  | UhpPoint // parabolic (type: boundary) or elliptic (type: interior)
  | null; // identity, because it actually fixes all points
```

The possible fixed points of a `UhpIsometry`, see below

#### UhpIsometry

A class epresenting a(n orientation preserving) Möbius transformation that preserves distances in the Upper Half Plane. Isometries come in three types: hyperbolic (translations), elliptic (rotations), or parabolic ("rotations" around a boundary point)

**Fields**

- `type`: `"hyperbolic"` | `"elliptic"` | `"parabolic"` | `"identity"`
- `fixedPoints`: `UhpFixedPoints`
- `standardForm`: `UhpIsometry` – canonical form of the isometry
- `conjToStd`: `UhpIsometry | null` – conjugating isometry to the standard form
- `translationLength?`: `number` – only for hyperbolic
- `axisOfTranslation?`: `UhpGeodesic` – only for hyperbolic
- `angleOfRotation?`: `number` – only for elliptic
- `displacement?`: `number` – only for parabolic

**Key Methods**

- `compose(n: UhpIsometry): UhpIsometry` – composition
- `conjugate(n: UhpIsometry): UhpIsometry` – conjugation
- `inverse(): UhpIsometry` – inverse transformation
- `apply(z: [number, number] | UhpPoint): UhpPoint` – apply to a point

---

### UHP Methods

#### Points

```ts
point(arg: [number, number] | UhpPoint): UhpPoint
```

Creates a point.

- `arg`: point, either as a real and imaginary part or as a UhpPoint

---

#### Distance

```ts
distance(
  z: UhpPoint | [number, number],
  w: UhpPoint | [number, number]
): number
```

Computes the distance between two points.

- `z`, `w`: points, either as a real and imaginary part or as a UhpPoint

---

#### Angles

```ts
angle(
  p: UhpPoint | [number, number],
  q: UhpPoint | [number, number],
  r: UhpPoint | [number, number]
): number
```

Computes the angle (in radians) made by three points, i.e., the angle of intersection at `q` of the geodesic between `p` and `q` and the geodesic between `q` and `r`.

- `p`, `q`, `r`: points, either as a real and imaginary part or as a UhpPoint

---

#### Geodesics

```ts
geodesic(
  z: [number, number] | UhpPoint,
  w: [number, number] | UhpPoint
): UhpGeodesic;
geodesic(
  base: [number, number] | UhpPoint,
  direction: { x: number; y: number }
): UhpGeodesic;
```

Constructs a geodesic. Accepts either a pair of points or a point and a direction.

- `z`, `w`, `base`: points, either as a real and imaginary part or as a UhpPoint
- `direction`: a vector providing a direction to draw the geodesic from `base` -- `x` and `y` can be any two finite values.

---

#### Circles

```ts
circle(center: [number, number] | UhpPoint, radius: number): UhpCircle;
circle(
  center: [number, number] | UhpPoint,
  bdryPoint: [number, number] | UhpPoint
): UhpCircle;
```

Constructs a hyperbolic circle. Accepts either a center and a radius or a center and a point on the circle.

- `center`, `bdryPoint`: points, either as a real and imaginary part or as a UhpPoint
- `radius`: a positive number representing the (hyperbolic) radius of the circle

---

#### Horocycles

```ts
horocycle(center: [number, number] | UhpPoint): UhpHorocycle;
horocycle(
  base: [number, number] | UhpPoint,
  onHorPoint: [number, number] | UhpPoint
): UhpHorocycle;
```

Constructs a horocycle. Accepts either an interior point as the (Euclidean) center of the horocycle, or a boundary point as the base and a point on the horocycle.

- `center`, `onHorPoint`: an interior point (i.e., the real part is finite and the imaginary part is positive), either as a real and imaginary part or as a UhpPoint
- `base`: a boundary point (i.e., the real part is finite and the imaginary part is zero or both are infinity), either as a real and imaginary part or as a UhpPoint

---

#### Polygons

```ts
polygon(vertices: [number, number][] | UhpPoint[]): UhpPolygon
```

Constructs a hyperbolic polygon from vertices.

- `vertices`: array of vertices, either as a real and imaginary part or as a UhpPoint. Throws if the length of `vertices` is less than 3.

---

#### Isometries

**General**

```ts
isometry(coeffs: [number, number][] | ComplexNumber[]): UhpIsometry
```

Creates an isometry from complex coefficients, and returns an isometry with reduced coefficients, i.e., scaled so that the determinant is 1.

- `coeffs`: array of coefficients, either as a real and imaginary part or as a ComplexNumber.

Throws if:
- The array is not exactly length 4.
- The determinant of the resulting Möbius transformation is not positive.

**Elliptic**

```ts
elliptic(center: [number, number] | UhpPoint, theta: number): UhpIsometry
```

Creates an elliptic isometry (rotation) of angle `theta` about `center`.

- `center`: an interior point (i.e., the real part is finite and the imaginary part is positive), either as a real and imaginary part or as a UhpPoint
- `theta`: the angle by which to rotate, any finite number

**Hyperbolic**

```ts
hyperbolic(
  z: [number, number] | UhpPoint,
  w: [number, number] | UhpPoint
): UhpIsometry;
hyperbolic(
  z: [number, number] | UhpPoint,
  w: [number, number] | UhpPoint,
  distance: number
): UhpIsometry;
hyperbolic(
  base: [number, number] | UhpPoint,
  direction: { x: number; y: number },
  distance: number
): UhpIsometry;
hyperbolic(
  base: [number, number] | UhpPoint,
  direction: { x: number; y: number }
): UhpIsometry;
```

Creates a hyperbolic isometry (translation).

First overload:
- `z`, `w`: interior points (i.e., the real part is finite and the imaginary part is positive), either as a real and imaginary part or as a UhpPoint

Second overload:
- `z`, `w`: points, either as a real and imaginary part or as a UhpPoint
- `distance`: the distance to translate from `z` toward `w`. If distance is negative, then the translation occurs from `w` toward `z`

Third overload
- `base`: point, either as a real and imaginary part or as a UhpPoint
- `direction`: a vector providing a direction to draw the geodesic from `base` toward
- `distance`: the distance to translate from `base` in `direction`; if `distance` is negative, then the translation occurs in the opposite direction

Fourth overload:
- `base`: point, either as a real and imaginary part or as a UhpPoint
- `direction`: a vector providing a direction to draw the geodesic from `base` toward; translates a distance equal to the length of the direction vector

**Parabolic**

```ts
parabolic(
  bdry: [number, number] | UhpPoint,
  displacement: number
): UhpIsometry
```

Creates a parabolic isometry ("rotation" about a boundary point)

- `bdry`: the boundary point (i.e., the real part is finite and the imaginary part is 0 or both are infinite) that the isometry fixes, either as a real and imaginary part or as a UhpPoint
- `displacement`: the amount of "rotation" that occurs

---

#### Conjugacy

```ts
areConjugate(m: UhpIsometry, n: UhpIsometry): UhpIsometry | null
```

Checks if two isometries are conjugate. Returns a conjugating isometry or `null` if they are not conjugate.

---

## PoincareDisk

Coming soon

---

### PD Constructor

Blah blah

---

### PD Types

hergy dergy

---

### PD Methods

hergy dergy

---
