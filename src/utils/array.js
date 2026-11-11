export const arrayEquals = (a, b) => {
  return a.sort().toString() === b.sort().toString()
}
