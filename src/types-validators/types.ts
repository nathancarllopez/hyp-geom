export type ComplexNumber = {
  re: number;
  im: number;
};

export type PositiveNumber = number & { __brand: "PositiveNumber" };

export interface UpperHalfPlanePoint extends ComplexNumber {
  re: number;
  im: PositiveNumber;
}

export type MobiusTransformation = {
  a: ComplexNumber;
  b: ComplexNumber;
  c: ComplexNumber;
  d: ComplexNumber;
};

export type Isometry = MobiusTransformation & { __brand: "Isometry" };

export type UhpGeodesic = {
  isVertical: boolean;
  center: ComplexNumber;    // { re: Infinity, im: Infinity } if isVertical, otherwise a point on the real axis
  radius: number;           // Distance between center and any point on the geodesic, Infinity if isVertical
  points: ComplexNumber[];  // Given two UpperHalfPlanePoints z, w, points is the array [bdryPointZ, z, w, bdryPointW]
};
