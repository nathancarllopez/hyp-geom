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
