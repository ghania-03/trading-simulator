function PriceChart({ history = [] }) {
  const width = 700;
  const height = 300;

  const padding = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 70,
  };

  if (history.length < 2) {
    return (
      <section>
        <h2>Price Chart</h2>
        <p>Collecting price history...</p>
      </section>
    );
  }

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const prices = history.map(
    (point) => point.price,
  );

  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);

  /*
    Prevent a zero-height chart when all
    recorded prices are identical.
  */
  if (minPrice === maxPrice) {
    const offset =
      minPrice === 0
        ? 1
        : minPrice * 0.01;

    minPrice -= offset;
    maxPrice += offset;
  }

  const getX = (index) => {
    if (history.length === 1) {
      return padding.left;
    }

    return (
      padding.left +
      (index / (history.length - 1)) *
        chartWidth
    );
  };

  const getY = (price) => {
    const normalized =
      (price - minPrice) /
      (maxPrice - minPrice);

    return (
      padding.top +
      (1 - normalized) * chartHeight
    );
  };

  const points = history
    .map(
      (point, index) =>
        `${getX(index)},${getY(
          point.price,
        )}`,
    )
    .join(" ");

  const latestPrice =
    history[history.length - 1].price;

  return (
    <section>
      <h2>Price Chart</h2>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="Asset price history chart"
      >
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
        />

        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
        />

        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <text
          x={padding.left - 10}
          y={padding.top + 5}
          textAnchor="end"
          fontSize="12"
        >
          ${maxPrice.toFixed(2)}
        </text>

        <text
          x={padding.left - 10}
          y={height - padding.bottom}
          textAnchor="end"
          fontSize="12"
        >
          ${minPrice.toFixed(2)}
        </text>

        <text
          x={width - padding.right}
          y={padding.top}
          textAnchor="end"
          fontSize="12"
        >
          ${latestPrice.toFixed(2)}
        </text>
      </svg>

      <p>
        Data points: {history.length}
      </p>
    </section>
  );
}

export default PriceChart;