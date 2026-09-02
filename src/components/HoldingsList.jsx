import { Link } from "react-router-dom";

import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";
import { assets } from "../data/assets";
import {
  calculateHoldingFinancials,
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

function formatQuantity(value) {
  return Number(value).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 8,
    },
  );
}

function HoldingsList() {
  const holdings = usePortfolioStore(
    (state) => state.holdings,
  );

  const { prices } = usePriceFeed();

  const holdingEntries =
    Object.entries(holdings);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              My Holdings
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your currently held assets and their
              live market value.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {holdingEntries.length}{" "}
            {holdingEntries.length === 1
              ? "asset"
              : "assets"}
          </span>
        </div>
      </div>

      {holdingEntries.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-lg text-slate-400">
              $
            </span>
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            No holdings yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Buy an asset from the Market to start
            building your portfolio.
          </p>

          <Link
            to="/app/market"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Browse Market
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Asset
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Avg. Buy
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Market Value
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    P&L
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {holdingEntries.map(
                  ([assetId, holding]) => {
                    const asset = assets.find(
                      (item) =>
                        item.id === assetId,
                    );

                    const priceData =
                      prices[assetId];

                    const quantity =
                      Number(
                        holding?.quantity,
                      ) || 0;

                    const averageBuyPrice =
                      Number(
                        holding?.averageBuyPrice,
                      ) || 0;

                    if (!asset) {
                      return (
                        <tr key={assetId}>
                          <td
                            colSpan="6"
                            className="px-6 py-5"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {assetId.toUpperCase()}
                            </p>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Asset information
                              unavailable.
                            </p>
                          </td>
                        </tr>
                      );
                    }

                    if (!priceData) {
                      return (
                        <tr key={assetId}>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {asset.symbol}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {asset.name}
                            </p>
                          </td>

                          <td className="px-4 py-5 text-right text-sm text-slate-700 dark:text-slate-300">
                            {formatQuantity(
                              quantity,
                            )}
                          </td>

                          <td className="px-4 py-5 text-right text-sm text-slate-700 dark:text-slate-300">
                            {formatCurrency(
                              averageBuyPrice,
                            )}
                          </td>

                          <td
                            colSpan="3"
                            className="px-6 py-5 text-right text-sm text-slate-400"
                          >
                            Current price
                            loading...
                          </td>
                        </tr>
                      );
                    }

                    const currentPrice =
                      priceData.current;

                    const {
                      marketValue,
                      unrealizedPnl,
                      unrealizedPnlPercentage,
                    } =
                      calculateHoldingFinancials(
                        quantity,
                        averageBuyPrice,
                        currentPrice,
                      );

                    const pnlPositive =
                      unrealizedPnl >= 0;

                    return (
                      <tr
                        key={assetId}
                        className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-5">
                          <Link
                            to={`/app/asset/${asset.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {asset.symbol.slice(
                                0,
                                3,
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900 transition group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300">
                                {asset.symbol}
                              </p>

                              <p className="max-w-[160px] truncate text-xs text-slate-500 dark:text-slate-400">
                                {asset.name}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-4 py-5 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatQuantity(
                            quantity,
                          )}
                        </td>

                        <td className="px-4 py-5 text-right text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(
                            averageBuyPrice,
                          )}
                        </td>

                        <td className="px-4 py-5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(
                            currentPrice,
                          )}
                        </td>

                        <td className="px-4 py-5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(
                            marketValue,
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <p
                            className={`text-sm font-bold ${
                              pnlPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {unrealizedPnl >= 0
                              ? "+"
                              : "-"}
                            $
                            {Math.abs(
                              unrealizedPnl,
                            ).toFixed(2)}
                          </p>

                          <p
                            className={`mt-0.5 text-xs font-medium ${
                              pnlPositive
                                ? "text-emerald-600/80 dark:text-emerald-400/80"
                                : "text-red-600/80 dark:text-red-400/80"
                            }`}
                          >
                            {unrealizedPnlPercentage >=
                            0
                              ? "+"
                              : ""}
                            {unrealizedPnlPercentage.toFixed(
                              2,
                            )}
                            %
                          </p>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
            {holdingEntries.map(
              ([assetId, holding]) => {
                const asset = assets.find(
                  (item) =>
                    item.id === assetId,
                );

                const priceData =
                  prices[assetId];

                const quantity =
                  Number(
                    holding?.quantity,
                  ) || 0;

                const averageBuyPrice =
                  Number(
                    holding?.averageBuyPrice,
                  ) || 0;

                if (!asset) {
                  return (
                    <div
                      key={assetId}
                      className="p-5"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {assetId.toUpperCase()}
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Asset information
                        unavailable.
                      </p>
                    </div>
                  );
                }

                if (!priceData) {
                  return (
                    <div
                      key={assetId}
                      className="p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {asset.symbol}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {asset.name}
                          </p>
                        </div>

                        <span className="text-xs text-slate-400">
                          Loading...
                        </span>
                      </div>
                    </div>
                  );
                }

                const currentPrice =
                  priceData.current;

                const {
                  marketValue,
                  costBasis,
                  unrealizedPnl,
                  unrealizedPnlPercentage,
                } =
                  calculateHoldingFinancials(
                    quantity,
                    averageBuyPrice,
                    currentPrice,
                  );

                const pnlPositive =
                  unrealizedPnl >= 0;

                return (
                  <Link
                    key={assetId}
                    to={`/app/asset/${asset.id}`}
                    className="block p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {asset.symbol.slice(
                            0,
                            3,
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {asset.symbol}
                          </p>

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {asset.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            pnlPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {unrealizedPnl >= 0
                            ? "+"
                            : "-"}
                          $
                          {Math.abs(
                            unrealizedPnl,
                          ).toFixed(2)}
                        </p>

                        <p
                          className={`text-xs font-medium ${
                            pnlPositive
                              ? "text-emerald-600/80 dark:text-emerald-400/80"
                              : "text-red-600/80 dark:text-red-400/80"
                          }`}
                        >
                          {unrealizedPnlPercentage >=
                          0
                            ? "+"
                            : ""}
                          {unrealizedPnlPercentage.toFixed(
                            2,
                          )}
                          %
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatQuantity(
                            quantity,
                          )}{" "}
                          {asset.symbol}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Market Value
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(
                            marketValue,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Avg. Buy Price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(
                            averageBuyPrice,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Current Price
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(
                            currentPrice,
                          )}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">
                          Cost Basis
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(
                            costBasis,
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default HoldingsList;