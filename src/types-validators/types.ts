import { UhpIsometry } from "../upper-half-plane/isometries";

export type ComplexNumber = {
  re: number;
  im: number;
};

export type PositiveNumber = number & { __brand: "PositiveNumber" };

export type PointAtInfinity = ComplexNumber & { __brand: "PointAtInfinity" };

export interface UhpRealLine extends ComplexNumber {
  im: 0;
}

export interface UhpInteriorPoint extends ComplexNumber {
  im: PositiveNumber;
}

export type UhpBoundaryPoint = UhpRealLine | PointAtInfinity

export type UhpPoint = UhpBoundaryPoint | UhpInteriorPoint;

export type UhpGeodesicPoints = [
  UhpBoundaryPoint | PointAtInfinity,
  UhpInteriorPoint,
  UhpInteriorPoint,
  UhpBoundaryPoint | PointAtInfinity
]; // Contains the endpoints of the geodesic and two interior points, ordered by how the points were given (see upper-half-plane/geometry.ts)
export type UhpGeodesic = {
  isVertical: boolean;
  center: PointAtInfinity | UhpBoundaryPoint; // { re: Infinity, im: Infinity } if isVertical, otherwise a point on the real axis
  radius: number; // Distance between center and any point on the geodesic, Infinity if isVertical
  points: UhpGeodesicPoints;
};

export type UhpGeodesicSegment = UhpGeodesic & {
  intAngles: [number, number] | null // The angles of the interior points on the geodesic arc with respect to the center and radius. If isVertical is true, this will be null
  intHeights: [number, number] | null // The heights of the interior points on the geodesic when the geodesic is vertical, null otherwise
  length: number; // The hyperbolic distance between the two interior points
};

export type UhpGeodesicRay = UhpGeodesic & {
  baseAngle: number | null // The angle the base point makes on the geodesic arc with respect to the center and radius. If isVertical is true, this will be null
  headingRight: boolean | null // Whether the ray extends to the left/right from the base point. Is null when isVertical is true
  baseHeight: number | null // The height of the base point on the geodesic arc when it is vertical, null otherwise
  headingUp: boolean | null // Whether the ray extends up/down from the basepoint. Is null when isVertical is false
}

export type UhpCircle = {
  center: UhpInteriorPoint;
  radius: number;
  eucCenter: UhpInteriorPoint;
  eucRadius: number;
};

export type UhpHorocycle = {
  basePoint: UhpBoundaryPoint | PointAtInfinity;
  onHorPoint: UhpInteriorPoint;
  center: UhpInteriorPoint | PointAtInfinity;
  eucRadius: number;
};

export type UhpPolygon = {
  vertices: UhpPoint[];
  sides: UhpGeodesicSegment[];
  angles: number[];
  area: number;
  perimeter: number;
};

export interface UhpIsometryInfo {
  type: "hyperbolic" | "elliptic" | "parabolic" | "identity";
  original: UhpIsometry;
  standard: UhpIsometry;
  conjugation: UhpIsometry;
  fixedPoints:
    | [UhpBoundaryPoint, UhpBoundaryPoint]  // hyperbolic
    | UhpBoundaryPoint  // parabolic
    | UhpInteriorPoint  // elliptic
    | null  // identity, because it actually fixes all points
  translationLength?: number // only for hyperbolic
  axisOfTranslation?: UhpGeodesic // only for hyperbolic
  angleOfRotation?: number // only for elliptic
  parabolicDisplacement?: number // only for parabolic
}

export interface UhpConjugateInfo { 
  isConjugate: boolean; 
  conjugation: UhpIsometry | null
}