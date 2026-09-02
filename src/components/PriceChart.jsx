import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {formatTime(point.timestamp)}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {formatPrice(point.price)}
      </p>
    </div>
  );
}

function PriceChart({ history = [] }) {
  if (history.length < 2) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Price Chart
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Collecting price history...
          </p>
        </div>

        <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Waiting for enough price data
          </p>
        </div>
      </section>
    );
  }

  const chartData = history.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
  }));

  const prices = chartData.map((point) => point.price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const latestPrice =
    chartData[chartData.length - 1].price;

  const firstPrice = chartData[0].price;

  const overallChange = latestPrice - firstPrice;

  const overallPercentage =
    firstPrice !== 0
      ? (overallChange / firstPrice) * 100
      : 0;

  const trendIsUp = overallChange >= 0;

  const range = maxPrice - minPrice;

  const domainPadding =
    range === 0
      ? Math.max(minPrice * 0.01, 1)
      : range * 0.08;

  const domainMin = Math.max(
    0,
    minPrice - domainPadding,
  );

  const domainMax =
    maxPrice + domainPadding;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Price Chart
          </h2>

          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatPrice(latestPrice)}
            </span>

            <span
              className={`text-sm font-semibold ${
                trendIsUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {overallChange >= 0 ? "+" : ""}
              {overallChange.toFixed(2)}
              {" ("}
              {overallPercentage >= 0 ? "+" : ""}
              {overallPercentage.toFixed(3)}
              {"%)"}
            </span>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {chartData.length} data points
        </div>
      </div>

      <div
        className="h-72 w-full sm:h-80"
        role="img"
        aria-label="Asset price history chart"
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="priceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={
                    trendIsUp
                      ? "#10b981"
                      : "#ef4444"
                  }
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor={
                    trendIsUp
                      ? "#10b981"
                      : "#ef4444"
                  }
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-slate-200 dark:stroke-slate-800"
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              tick={{ fontSize: 11 }}
              tickMargin={8}
              minTickGap={40}
              axisLine={false}
              tickLine={false}
              className="fill-slate-500 dark:fill-slate-400"
            />

            <YAxis
              domain={[
                domainMin,
                domainMax,
              ]}
              tickFormatter={formatPrice}
              tick={{ fontSize: 11 }}
              tickMargin={8}
              width={75}
              axisLine={false}
              tickLine={false}
              className="fill-slate-500 dark:fill-slate-400"
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "currentColor",
                strokeOpacity: 0.15,
              }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke={
                trendIsUp
                  ? "#10b981"
                  : "#ef4444"
              }
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default PriceChart;