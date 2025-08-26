export type ComplexNumber = {
  re: number;
  im: number;
}

export function complex(re: number, im: number): ComplexNumber {
  return { re, im };
}