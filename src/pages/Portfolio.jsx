import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";
import HoldingsList from "../components/HoldingsList";
import TransactionHistory from "../components/TransactionHistory";
import {
  calculatePortfolioFinancials,
} from "../utils/portfolioCalculations";

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatPnl(value) {
  const numericValue = Number(value) || 0;

  return `${numericValue >= 0 ? "+" : "-"}$${Math.abs(
    numericValue,
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Portfolio() {
  const { prices } = usePriceFeed();

  const cash = usePortfolioStore(
    (state) => state.cash,
  );

  const holdings = usePortfolioStore(
    (state) => state.holdings,
  );

  const transactions = usePortfolioStore(
    (state) => state.transactions,
  );

  const {
    holdingsValue,
    portfolioValue,
    realizedPnl,
    unrealizedPnl,
    totalPnl,
    totalPnlPercentage,
  } = calculatePortfolioFinancials({
    cash,
    holdings,
    prices,
    transactions,
  });

  const totalPnlPositive = totalPnl >= 0;
  const unrealizedPositive =
    unrealizedPnl >= 0;
  const realizedPositive =
    realizedPnl >= 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Portfolio
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Your Portfolio
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track your holdings, available cash, and
              trading performance in real time.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total portfolio value
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
        </div>
      </section>

      {/* Main P&L card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total P&L
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${
                    totalPnlPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatPnl(totalPnl)}
                </span>

                <span
                  className={`text-sm font-semibold ${
                    totalPnlPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ({totalPnlPercentage >= 0 ? "+" : ""}
                  {totalPnlPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                totalPnlPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
              }`}
            >
              {totalPnlPositive
                ? "Portfolio is up"
                : "Portfolio is down"}
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 dark:divide-slate-800">
          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Available Cash
            </p>

            <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
              {formatCurrency(cash)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Holdings Value
            </p>

            <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
              {formatCurrency(holdingsValue)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unrealized P&L
            </p>

            <p
              className={`mt-2 text-xl font-bold ${
                unrealizedPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatPnl(unrealizedPnl)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Realized P&L
            </p>

            <p
              className={`mt-2 text-xl font-bold ${
                realizedPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatPnl(realizedPnl)}
            </p>
          </div>
        </div>
      </section>

      {/* Holdings */}
      <HoldingsList />

      {/* Transactions */}
      <TransactionHistory />
    </div>
  );
}

export default Portfolio;