// Original geometry inspired by the curved, modular forms at shapes.gallery.
// IDs start at 25 to preserve saved shapes and the custom upload slot (24).
export const galleryShapes = [
  { id: 25, name: 'Pinwheels', path: 'M48 48H4V4A44 44 0 0 1 48 48ZM52 48V4H96A44 44 0 0 1 52 48ZM52 52H96V96A44 44 0 0 1 52 52ZM48 52V96H4A44 44 0 0 1 48 52Z' },
  { id: 26, name: 'Ribbons', path: 'M4 46A42 42 0 0 1 46 4V22A24 24 0 0 0 22 46ZM54 4H96A42 42 0 0 1 54 46V28A24 24 0 0 0 78 4ZM4 96A42 42 0 0 1 46 54V72A24 24 0 0 0 22 96ZM54 54H96A42 42 0 0 1 54 96V78A24 24 0 0 0 78 54Z' },
  { id: 27, name: 'Hourglasses', path: 'M4 4H28A22 22 0 0 0 72 4H96A46 46 0 0 1 4 4ZM4 96A46 46 0 0 1 96 96H72A22 22 0 0 0 28 96Z' },
  { id: 28, name: 'Inward stars', path: 'M4 4H96Q50 4 50 48Q50 4 4 4ZM96 4V96Q96 50 52 50Q96 50 96 4ZM96 96H4Q50 96 50 52Q50 96 96 96ZM4 96V4Q4 50 48 50Q4 50 4 96Z' },
  { id: 29, name: 'Petal rings', path: 'M50 4C62 4 64 14 70 20C76 26 90 24 94 36C98 48 90 54 88 62C86 70 90 82 80 90C70 98 60 90 50 90C40 90 30 98 20 90C10 82 14 70 12 62C10 54 2 48 6 36C10 24 24 26 30 20C36 14 38 4 50 4ZM50 30A20 20 0 1 0 50 70A20 20 0 1 0 50 30Z' },
  { id: 30, name: 'Round crosses', path: 'M38 4H62Q68 4 68 10V32H90Q96 32 96 38V62Q96 68 90 68H68V90Q68 96 62 96H38Q32 96 32 90V68H10Q4 68 4 62V38Q4 32 10 32H32V10Q32 4 38 4Z' },
] as const

const paths = new Map<number, Path2D>()
export function galleryPath(id: number): Path2D | undefined {
  if (paths.has(id)) return paths.get(id)
  const shape = galleryShapes.find(item => item.id === id)
  if (!shape) return undefined
  const path = new Path2D(shape.path)
  paths.set(id, path)
  return path
}
