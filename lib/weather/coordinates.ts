export function normalizeCoordinate(value: number) {
  return Number(value.toFixed(2)) || 0;
}
