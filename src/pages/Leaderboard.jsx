import { useMemo } from "react";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { calculateFinancialsFromTransactions } from "../utils/portfolioCalculations";

function formatPnl(value) {
  const numericValue = Number(value) || 0;

  return `${numericValue >= 0 ? "+" : "-"}$${Math.abs(
    numericValue,
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Leaderboard() {
  const { user } = useContext(AuthContext);

  const { data, isLoading, isError, error, refetch } = useLeaderboard();

  const leaderboard = useMemo(() => {
    if (!data) {
      return [];
    }

    const { users, transactions } = data;

    return users
      .map((currentUser) => {
        const userTransactions = transactions.filter(
          (transaction) => transaction.userId === currentUser.id,
        );

        const { realizedPnl } =
          calculateFinancialsFromTransactions(userTransactions);

        return {
          id: currentUser.id,
          name: currentUser.name,
          realizedPnl,
        };
      })
      .sort((a, b) => b.realizedPnl - a.realizedPnl)
      .map((currentUser, index) => ({
        ...currentUser,
        rank: index + 1,
      }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <section>
          <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

          <div className="mt-4 h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </section>

        <section className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <section>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Leaderboard
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Trader Rankings
          </h1>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-950/60 dark:bg-red-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-red-800 dark:text-red-300">
                Unable to load leaderboard
              </h2>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-400/80">
                {error?.message ||
                  "Something went wrong while loading the rankings."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="w-fit rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </section>
      </div>
    );
  }

  const currentUserEntry = leaderboard.find((entry) => entry.id === user?.id);

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live Rankings
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Trader Leaderboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              See how traders rank based on their realized trading performance.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Traders
            </p>

            <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
              {leaderboard.length}
            </p>
          </div>
        </div>
      </section>

      {/* Current user */}
      {currentUserEntry && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold dark:bg-white/10">
                {currentUserEntry.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Ranking
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {currentUserEntry.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rank
                </p>

                <p className="mt-1 text-2xl font-bold">
                  #{currentUserEntry.rank}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Realized P&L
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    currentUserEntry.realizedPnl >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatPnl(currentUserEntry.realizedPnl)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {leaderboard.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-lg text-slate-400">#</span>
          </div>

          <h2 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            No traders available
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The leaderboard will appear once users are available.
          </p>
        </section>
      ) : (
        <>
          {/* Top three */}
          {topThree.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Top Traders
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Leading traders by realized P&L.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {topThree.map((entry) => {
                  const isCurrentUser = entry.id === user?.id;

                  const positive = entry.realizedPnl >= 0;

                  return (
                    <div
                      key={entry.id}
                      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 ${
                        isCurrentUser
                          ? "border-slate-900 ring-1 ring-slate-900 dark:border-white dark:ring-white"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {entry.name.slice(0, 2).toUpperCase()}
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          #{entry.rank}
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold text-slate-950 dark:text-white">
                            {entry.name}
                          </h3>

                          {isCurrentUser && (
                            <span className="shrink-0 text-xs font-semibold text-slate-400">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          Realized P&L
                        </p>

                        <p
                          className={`mt-2 text-2xl font-bold ${
                            positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatPnl(entry.realizedPnl)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Full rankings */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                All Rankings
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Complete trader standings.
              </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left dark:border-slate-800 dark:bg-slate-950/40">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Rank
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Trader
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Realized P&L
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.id === user?.id;

                    const positive = entry.realizedPnl >= 0;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition ${
                          isCurrentUser
                            ? "bg-slate-50 dark:bg-slate-800/50"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex min-w-8 items-center justify-center rounded-lg px-2 py-1 text-xs font-bold ${
                              entry.rank <= 3
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {entry.name.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {entry.name}
                              </p>

                              {isCurrentUser && (
                                <p className="text-xs font-medium text-slate-400">
                                  You
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm font-bold ${
                              positive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatPnl(entry.realizedPnl)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.id === user?.id;

                const positive = entry.realizedPnl >= 0;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between gap-4 p-5 ${
                      isCurrentUser ? "bg-slate-50 dark:bg-slate-800/50" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          entry.rank <= 3
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        #{entry.rank}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {entry.name}
                        </p>

                        {isCurrentUser && (
                          <p className="text-xs font-medium text-slate-400">
                            You
                          </p>
                        )}
                      </div>
                    </div>

                    <p
                      className={`shrink-0 text-sm font-bold ${
                        positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPnl(entry.realizedPnl)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Leaderboard;