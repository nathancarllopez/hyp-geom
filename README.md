# hyp-geom

A TypeScript library for working with hyperbolic geometry. This package provides geometric tools for the [upper half plane model](https://en.wikipedia.org/wiki/Poincar%C3%A9_half-plane_model) of the hyperbolic plane.

[![npm version](https://img.shields.io/npm/v/hyp-geom.svg)](https://www.npmjs.com/package/hyp-geom)
[![License](https://img.shields.io/github/license/nathancarllopez/hyp-geom.svg)](./LICENSE)

---

## Installation

```bash
npm install hyp-geom
```

or with yarn:

```bash
yarn add hyp-geom
```

---

## Features

- Distance and angle calculations
- Formulas and information for curves/shapes including geodesics (lines), circles, horocycles, and polygons
- Hyperbolic isometries as Möbius transformations, either by specifying the coordinates of the corresponding matrix or by choosing from one of the three types (hyperbolic, elliptic, or parabolic)

---

## Planned Features

- Angle measure at intersection point of curves
- Support for additional models including the [Poincare Disk model](https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model), the [Bertrami-Klein model](https://en.wikipedia.org/wiki/Beltrami%E2%80%93Klein_model), and the [Hyperboloid model](https://en.wikipedia.org/wiki/Hyperboloid_model)
- Drawings and animations, e.g., the action of an isometry on a model
- Support for fundamental domains, ultimately leading to 3d interactions with hyperbolic surfaces

---

## Quick Start

```ts
import { UhpIsometry } from "hyp-geom";

// Example: translation by 2 units
const uhp = new UpperHalfPlane();
const center = [0, 1];
const radius = 1;

const circle = uhp.circle(center, radius);

console.log(circle);
// {
//  center: { re: 0, im: 1 },
//  radius: 1,
//  eucCenter: { re: 0, im: (e + 1 / e) / 2 },
//  eucRadius: (e - 1 / e) / 2
// }
```

See [examples](./examples) for more usage demonstrations.

---

## Documentation

- [API Reference](./docs/api.md): Method signatures and usage
- [Mathematical Background (PDF)](./docs/hyp-geom-background.pdf): Derivations and theory

---

## Examples

The [examples](./examples) folder contains runnable TypeScript snippets showing:

- Computing distances and angles
- Working with hyperbolic curves (geodesics, circles, etc.)
- Basic translations, rotations, and reflections
- Applying isometries to points
- Classifying isometries

---

## Contributing

Contributions, issues, and feature requests are welcome! If you’d like to add functionality, improve docs, or suggest enhancements, please open an issue or submit a pull request.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT © [Nathan Lopez](https://github.com/nathancarllopez)
