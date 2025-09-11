# API Reference

This document describes the public API of the `hyp-geom` library.

---

## Table of Contents

- [Constants](#constants)
- [Overlapping Features](#overlapping-features)
  - [Base Classes](#base-classes)
    - [ComplexNumber](#complexnumber)
    - [MobiusTransformation](#mobiustransformation)
  - [Constructors](#constructors)
  - [Properties](#properties)
- [UpperHalfPlane](#upperhalfplane)
  - [UHP Types](#uhp-types)
  - [UHP Methods](#uhp-methods)
- [PoincareDisk](#poincaredisk)
  - [PD Types](#pd-types)
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

## Overlapping Features

Each of the classes in the API have some similar features, so we list them here instead of in each section below

### Base Classes

These classes are extended by the exposed api

#### ComplexNumber

Represents a complex number with relative/absolute tolerance checks.

##### Constructor

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

##### Fields

- `re: number` – real part
- `im: number` – imaginary part
- `modulus: number` – Euclidean modulus √(re² + im²)
- `rtol: number`: relative tolerance
- `atol: number`: absolute tolerance

##### Key Methods

- `isEqualTo(w: ComplexNumber): boolean` – equality with tolerances
- `add`, `subtract`, `multiply`, `divide` – arithmetic operations
- `conjugate(): ComplexNumber` – reflection across the real axis
- `inverse(): ComplexNumber` – multiplicative inverse
- `scale(lambda: number): ComplexNumber` – scalar multiplication
- `eucDistance(w: ComplexNumber): number` – Euclidean distance
- `angleBetween(w: ComplexNumber): number` – angle (via dot product)
- `principalNthRoot(n: number): ComplexNumber` – principal root (default square root)
- `clone(): ComplexNumber` – deep copy

---

#### MobiusTransformation

Represents a Möbius transformation

z => (a*z + b) / (c*z + d)

determined by four complex coefficients a, b, c, and d.

#### Constructor

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

#### Fields

- `coeffs`: coefficients array of type `ComplexNumber[]`
- `rtol: number`: relative tolerance
- `atol: number`: absolute tolerance

#### Key Methods

- `isEqualTo(n: MobiusTransformation): boolean`: Compares two transformations by testing their action on 1, 0, and i. A Mobius transformation is determined by its action on three points.
- `determinant(): ComplexNumber`: Returns ad - bc.
- `clone(): MobiusTransformation`: Deep copy.
- `reduce(): MobiusTransformation`: Normalizes coefficients so that determinant = 1.
- `compose(n: MobiusTransformation, doReduce = false): MobiusTransformation`: Returns the composition this ∘ n.
- `conjugate(n: MobiusTransformation, doReduce = false): MobiusTransformation`: Returns n⁻¹ ∘ this ∘ n. Throws if n is non-invertible.
- `inverse(doReduce = false): MobiusTransformation`: Returns the inverse transformation. Throws if determinant is zero.
- `apply(z: ComplexNumber): ComplexNumber`: Applies the transformation to a complex number, handling the point at infinity.

---

### Constructors

```ts
new UpperHalfPlane(
  rtol: number = STANDARD_RELATIVE_TOLERANCE,
  atol: number = STANDARD_ABSOLUTE_TOLERANCE
)

new PoincareDisk(
  rtol: number = STANDARD_RELATIVE_TOLERANCE,
  atol: number = STANDARD_ABSOLUTE_TOLERANCE
)
```

- `rtol`: relative tolerance (must be positive)  
- `atol`: absolute tolerance (must be positive)

Throws if either tolerance is set to a non-positive value.

---

### Properties

```ts
uhp.rtol: number
uhp.atol: number
```

Getters and setters for relative and absolute tolerances.  
Throws if set to a non-positive value.

---

## UpperHalfPlane

Represents the hyperbolic plane in the upper half-plane (UHP) model. Provides methods for constructing points and curves, as well as isometries and their classifications.

We first list the return types and then the class methods.

---

### UHP Types

These are returned by various methods:

- `UhpPoint`  
- `UhpGeodesic`  
- `UhpCircle`  
- `UhpHorocycle`  
- `UhpPolygon`  
- `UhpIsometry`  

---

### UHP Methods

#### Points

```ts
uhp.point(z: [number, number]): UhpPoint
```

Creates a point in the UHP model.

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

Constructs a hyperbolic polygon from vertices.

---

#### Isometries

**General**

```ts
uhp.isometry(coeffs: [number, number][]): UhpIsometry
```

Creates an isometry from Möbius coefficients.

**Elliptic**

```ts
uhp.elliptic(center: [number, number], theta: number): UhpIsometry
```

Creates an elliptic isometry of angle `theta` about `center`.

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

Checks if two isometries are conjugate.  
Returns a conjugating isometry or `null`.

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