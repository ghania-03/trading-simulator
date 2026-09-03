import usePortfolioStore from "../store/portfolioStore";

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

function TransactionHistory() {
  const transactions =
    usePortfolioStore(
      (state) => state.transactions,
    );

  const sortedTransactions = [
    ...transactions,
  ].sort(
    (a, b) =>
      new Date(b.timestamp) -
      new Date(a.timestamp),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your recent buy and sell activity.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {transactions.length}{" "}
            {transactions.length === 1
              ? "trade"
              : "trades"}
          </span>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-lg text-slate-400">
              ↔
            </span>
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            No transactions yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your completed buy and sell trades will
            appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Type
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Asset
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Price
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedTransactions.map(
                  (transaction) => {
                    const isBuy =
                      transaction.type ===
                      "BUY";

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              isBuy
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {transaction.assetId.toUpperCase()}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                          {formatQuantity(
                            transaction.quantity,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(
                            transaction.price,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(
                            transaction.total,
                          )}
                        </td>

                        <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-slate-400">
                          {new Date(
                            transaction.timestamp,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
            {sortedTransactions.map(
              (transaction) => {
                const isBuy =
                  transaction.type === "BUY";

                return (
                  <div
                    key={transaction.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                            isBuy
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          }`}
                        >
                          {isBuy ? "B" : "S"}
                        </span>

                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {transaction.assetId.toUpperCase()}
                          </p>

                          <span
                            className={`text-xs font-semibold ${
                              isBuy
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(
                            transaction.total,
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Total
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatQuantity(
                            transaction.quantity,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(
                            transaction.price,
                          )}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(
                            transaction.timestamp,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default TransactionHistory;