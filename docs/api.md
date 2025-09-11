# API Reference

This document describes the public API of the `hyp-geom` library.

---

## Table of Contents

- [Constants](#constants)
- [Base Classes](#base-classes)
  - [ComplexNumber](#complexnumber)
  - [MobiusTransformation](#mobiustransformation)
- [UpperHalfPlane](#upperhalfplane)
  - [UHP Types](#uhp-types)
  - [UHP Constructor](#uhp-constructor)
  - [UHP Methods](#uhp-methods)
- [PoincareDisk](#poincaredisk)
  - [PD Types](#pd-types)
  - [PD Constructor](#pd-constructor)
  - [PD Methods](#pd-methods)

---

## Constants

```ts
STANDARD_RELATIVE_TOLERANCE: number = 1e-5
STANDARD_ABSOLUTE_TOLERANCE: number = 1e-8
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

### MobiusTransformation

Represents a Möbius transformation

z => (a*z + b) / (c*z + d)

determined by four complex coefficients a, b, c, and d.

### Constructor

```ts
new MobiusTransformation(
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

- `isEqualTo(n: MobiusTransformation): boolean`: Compares two transformations by testing their action on 1, 0, and i. A Mobius transformation is determined by its action on three points.
- `determinant(): ComplexNumber`: Returns ad - bc.
- `clone(): MobiusTransformation`: Deep copy.
- `reduce(): MobiusTransformation`: Normalizes coefficients so that determinant = 1.
- `compose(n: MobiusTransformation, doReduce = false): MobiusTransformation`: Returns the composition this ∘ n.
- `conjugate(n: MobiusTransformation, doReduce = false): MobiusTransformation`: Returns n⁻¹ ∘ this ∘ n. Throws if n is non-invertible.
- `inverse(doReduce = false): MobiusTransformation`: Returns the inverse transformation. Throws if determinant is zero.
- `apply(z: ComplexNumber): ComplexNumber`: Applies the transformation to a complex number, handling the point at infinity.

---

## UpperHalfPlane

Represents the hyperbolic plane in the upper half-plane (UHP) model. Provides methods for constructing points and curves, as well as isometries and their classifications.

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
- `readius`:  Distance between center and any point on the geodesic, Infinity if isVertical

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

Represents a(n orientation preserving) Möbius transformation that preserves distances in the Upper Half Plane. Isometries come in three types: hyperbolic (translations), elliptic (rotations), or parabolic ("rotations" around a boundary point)

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

### UHP Constructor

```ts
new UpperHalfPlane(
  rtol: number = STANDARD_RELATIVE_TOLERANCE,
  atol: number = STANDARD_ABSOLUTE_TOLERANCE
)
```

- `rtol`: relative tolerance (must be positive)  
- `atol`: absolute tolerance (must be positive)

Throws if:
- Tolerances are not positive

---

### UHP Methods

#### Points

```ts
point(arg: [number, number] | UhpPoint): UhpPoint
```

Creates a point in the UHP model.

- `arg`: real and complex part, or a UhpPoint

---

#### Distance and Angles

```ts
uhp.distance(z: [number, number], w: [number, number]): number
uhp.angle(p: [number, number], q: [number, number], r: [number, number]): number
```

- `distance`: hyperbolic distance between two points  
- `angle`: angle ∠PQR at `q` (in radians)

---

#### Geodesics

```ts
uhp.geodesic(z: [number, number], w: [number, number]): UhpGeodesic
uhp.geodesic(base: [number, number], direction: { x: number; y: number }): UhpGeodesic
```

Constructs geodesics through points or from a base point and direction.

---

#### Circles

```ts
uhp.circle(center: [number, number], radius: number): UhpCircle
uhp.circle(center: [number, number], bdryPoint: [number, number]): UhpCircle
```

Constructs hyperbolic circles from a center and radius or a center and a point on the boundary of the circle.

---

#### Horocycles

```ts
uhp.horocycle(center: [number, number]): UhpHorocycle
uhp.horocycle(base: [number, number], onHorPoint: [number, number]): UhpHorocycle
```

Constructs horocycles either from an interior center or from a boundary base point and a point on the horocycle.

---

#### Polygons

```ts
uhp.polygon(vertices: [number, number][]): UhpPolygon
```

Constructs a hyperbolic polygon from vertices, throws if less than three vertices are given.

---

#### Isometries

**General**

```ts
uhp.isometry(coeffs: [number, number][]): UhpIsometry
```

Creates an isometry from Möbius coefficients (complex numbers). Throws if the underlying mobius transformation does not have a positive determinant.

**Elliptic**

```ts
uhp.elliptic(center: [number, number], theta: number): UhpIsometry
```

Creates an elliptic isometry of angle `theta` about `center`. Throws

**Hyperbolic** (overloaded)

```ts
uhp.hyperbolic(z: [number, number], w: [number, number]): UhpIsometry
uhp.hyperbolic(z: [number, number], w: [number, number], distance: number): UhpIsometry
uhp.hyperbolic(base: [number, number], direction: { x: number; y: number }): UhpIsometry
uhp.hyperbolic(base: [number, number], direction: { x: number; y: number }, distance: number): UhpIsometry
```

Creates hyperbolic translations using different input signatures.

**Parabolic**

```ts
uhp.parabolic(bdry: [number, number], displacement: number): UhpIsometry
```

Creates a parabolic isometry fixing a boundary point.

---

#### Conjugacy

```ts
uhp.areConjugate(m: UhpIsometry, n: UhpIsometry): UhpIsometry | null
```

Checks if two isometries are conjugate. Returns a conjugating isometry or `null` if they are not conjugate.

---

## PoincareDisk

Coming soon

### PD Constructor

Blah blah

---

### PD Properties

blah blah

---

### PD Types

hergy dergy

---

### PD Methods

hergy dergy

---