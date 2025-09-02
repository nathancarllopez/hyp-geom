export type ComplexNumber = {
  re: number;
  im: number;
};

export type PositiveNumber = number & { __brand: "PositiveNumber" };

export type PointAtInfinity = ComplexNumber & { __brand: "PointAtInfinity" };

export interface UhpBoundaryPoint extends ComplexNumber {
  im: 0;
}
export interface UhpInteriorPoint extends ComplexNumber {
  im: PositiveNumber;
}
export type UhpPoint = PointAtInfinity | UhpBoundaryPoint | UhpInteriorPoint;

export type UhpGeodesic = {
  isVertical: boolean;
  center: PointAtInfinity | UhpBoundaryPoint; // { re: Infinity, im: Infinity } if isVertical, otherwise a point on the real axis
  radius: number; // Distance between center and any point on the geodesic, Infinity if isVertical
  points: UhpPoint[]; // Contains the endpoints of the geodesic and two interior points, ordered by how the points were given (see upper-half-plane/geometry.ts)
};

export type UhpCircle = {
  center: UhpInteriorPoint;
  radius: number;
  eucCenter: UhpInteriorPoint;
  eucRadius: number;
};

export type UhpHorocycle = {
  center: UhpInteriorPoint | PointAtInfinity;
  basePoint: UhpBoundaryPoint | PointAtInfinity;
  bdryPoint: UhpInteriorPoint,
  eucRadius: number;
}

export type MobiusTransformation = {
  a: ComplexNumber;
  b: ComplexNumber;
  c: ComplexNumber;
  d: ComplexNumber;
};

export type Isometry = MobiusTransformation & { __brand: "Isometry" };
