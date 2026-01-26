// Custom type guard function to explicitly check the element type
export function isElement(value: any): value is Element {
  return value instanceof Element
}
