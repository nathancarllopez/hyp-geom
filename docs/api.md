# API Reference

This document describes the public API of the `hyp-geom` library.

---

## Table of Contents

- [Constants](#constants)
- [UpperHalfPlane](#upperhalfplane)  
  - [Constructor](#constructor)  
  - [Properties](#properties)
  - [Types](#upperhalfplane-types)
  - [Methods](#methods)  
    - [Points](#points)  
    - [Distance and Angles](#distance-and-angles)  
    - [Geodesics](#geodesics)  
    - [Circles](#circles)  
    - [Horocycles](#horocycles)  
    - [Polygons](#polygons)  
    - [Isometries](#isometries)  
    - [Conjugacy](#conjugacy)  

---

## Constants

```ts
STANDARD_RELATIVE_TOLERANCE: number = 1e-5
STANDARD_ABSOLUTE_TOLERANCE: number = 1e-8
```

Default tolerances for geometric computations.

---

## UpperHalfPlane

Represents the hyperbolic plane in the upper half-plane (UHP) model.  
Provides methods for constructing points, geodesics, circles, horocycles, polygons, and isometries.

### Constructor

```ts
new UpperHalfPlane(
  rtol: number = STANDARD_RELATIVE_TOLERANCE,
  atol: number = STANDARD_ABSOLUTE_TOLERANCE
)
```

- `rtol`: relative tolerance (must be positive)  
- `atol`: absolute tolerance (must be positive)

---

### Properties

```ts
uhp.rtol: number
uhp.atol: number
```

Getters and setters for relative and absolute tolerances.  
Throws if set to a non-positive value.

---

### Types

These are returned by various methods:

- `UhpPoint`  
- `UhpGeodesic`  
- `UhpCircle`  
- `UhpHorocycle`  
- `UhpPolygon`  
- `UhpIsometry`  

---

### Methods

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

Constructs hyperbolic circles.

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