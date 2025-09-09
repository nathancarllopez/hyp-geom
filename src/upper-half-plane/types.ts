import { UhpIsometry } from "./isometries";
import { UhpPoint } from "./points";

export type UhpGeodesic = {
  isVertical: boolean;
  center: UhpPoint; // { re: Infinity, im: Infinity } if isVertical, otherwise a point on the real axis
  radius: number; // Distance between center and any point on the geodesic, Infinity if isVertical
  points: UhpPoint[];
};

export type UhpGeodesicSegment = UhpGeodesic & {
  intAngles: [number, number] | null; // The angles of the interior points on the geodesic arc with respect to the center and radius. If isVertical is true, this will be null
  intHeights: [number, number] | null; // The heights of the interior points on the geodesic when the geodesic is vertical, null otherwise
  length: number; // The hyperbolic distance between the two interior points
};

export type UhpCircle = {
  center: UhpPoint;
  radius: number;
  eucCenter: UhpPoint;
  eucRadius: number;
};

export type UhpHorocycle = {
  basePoint: UhpPoint;
  onHorPoint: UhpPoint;
  center: UhpPoint;
  eucRadius: number;
};

export type UhpPolygon = {
  vertices: UhpPoint[];
  sides: UhpGeodesicSegment[];
  angles: number[];
  area: number;
  perimeter: number;
};

export type UhpFixedPoints =
  | [UhpPoint, UhpPoint] // hyperbolic
  | UhpPoint // parabolic (type: boundary) or elliptic (type: interior)
  | null; // identity, because it actually fixes all points

export interface UhpConjugateInfo {
  isConjugate: boolean;
  conjugation: UhpIsometry | null;
}
