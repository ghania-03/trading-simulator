import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

function SparklineTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-900 dark:text-white">
        ${Number(point.price).toFixed(2)}
      </p>
    </div>
  );
}

function Sparkline({ history = [], direction }) {
  if (history.length < 2) {
    return (
      <div
        className="h-12 w-28"
        aria-label="Price history loading"
      />
    );
  }

  const data = history.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
  }));

  const prices = data.map(
    (point) => point.price,
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceRange = maxPrice - minPrice;

  /*
    Give the chart a small amount of breathing room
    while keeping the Y-axis focused on the asset's
    actual recent price movement.
  */
  const padding =
    priceRange === 0
      ? Math.max(minPrice * 0.001, 0.01)
      : priceRange * 0.15;

  const domainMin = Math.max(
    0,
    minPrice - padding,
  );

  const domainMax =
    maxPrice + padding;

  const isUp = direction !== "down";

  const strokeColor = isUp
    ? "#10b981"
    : "#ef4444";

  const gradientId = isUp
    ? "sparklineUp"
    : "sparklineDown";

  return (
    <div
      className="h-12 w-28 sm:w-36"
      role="img"
      aria-label="Recent price movement"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{
            top: 3,
            right: 1,
            bottom: 3,
            left: 1,
          }}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={strokeColor}
                stopOpacity={0.2}
              />

              <stop
                offset="100%"
                stopColor={strokeColor}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <YAxis
            domain={[
              domainMin,
              domainMax,
            ]}
            hide
          />

          <Tooltip
            content={<SparklineTooltip />}
            cursor={false}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.8}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 3,
              strokeWidth: 1,
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;