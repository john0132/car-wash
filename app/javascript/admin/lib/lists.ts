/** `list` with the entry at `index` moved by `offset` places. */
export function moveItem<T>(list: T[], index: number, offset: number) {
  const next = [...list]
  const [entry] = next.splice(index, 1)
  next.splice(index + offset, 0, entry)
  return next
}
