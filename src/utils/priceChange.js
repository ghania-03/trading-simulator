export function getPriceChange(current, previous) {
  const change = current - previous;

  const percentage =
    previous === 0 ? 0 : (change / previous) * 100;

  const direction =
    change > 0
      ? "up"
      : change < 0
        ? "down"
        : "flat";

  return {
    change,
    percentage,
    direction,
  };
}