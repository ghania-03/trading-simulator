import { useMemo, useState } from "react";
import usePriceFeed from "../hooks/usePriceFeed";
import { useAssets } from "../hooks/useAssets";
import AssetCard from "../components/AssetCard";
import { getPriceChange } from "../utils/priceChange";

function MarketSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading market">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="hidden h-12 w-36 rounded bg-slate-200 dark:bg-slate-800 sm:block" />

            <div className="w-24 space-y-2">
              <div className="ml-auto h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="ml-auto h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Market() {
  const { prices } = usePriceFeed();

  const {
    data: assets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAssets();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const visibleAssets = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const filteredAssets = assets.filter((asset) => {
      if (!searchTerm) {
        return true;
      }

      return (
        asset.symbol.toLowerCase().includes(searchTerm) ||
        asset.name.toLowerCase().includes(searchTerm)
      );
    });

    if (sortBy === "default") {
      return filteredAssets;
    }

    return [...filteredAssets].sort((a, b) => {
      const priceA = prices[a.id];
      const priceB = prices[b.id];

      if (!priceA || !priceB) {
        return 0;
      }

      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "price-high") {
        return priceB.current - priceA.current;
      }

      if (sortBy === "price-low") {
        return priceA.current - priceB.current;
      }

      const changeA = getPriceChange(
        priceA.current,
        priceA.previous,
      );

      const changeB = getPriceChange(
        priceB.current,
        priceB.previous,
      );

      if (sortBy === "change-high") {
        return changeB.percentage - changeA.percentage;
      }

      if (sortBy === "change-low") {
        return changeA.percentage - changeB.percentage;
      }

      return 0;
    });
  }, [search, sortBy, prices, assets]);

  const marketStats = useMemo(() => {
    const pricedAssets = assets
      .map((asset) => prices[asset.id])
      .filter(Boolean);

    if (!pricedAssets.length) {
      return {
        totalAssets: assets.length,
        gainers: 0,
        losers: 0,
      };
    }

    let gainers = 0;
    let losers = 0;

    pricedAssets.forEach((priceData) => {
      const { percentage } = getPriceChange(
        priceData.current,
        priceData.previous,
      );

      if (percentage > 0) {
        gainers += 1;
      } else if (percentage < 0) {
        losers += 1;
      }
    });

    return {
      totalAssets: assets.length,
      gainers,
      losers,
    };
  }, [assets, prices]);

  if (isLoading) {
    return <MarketSkeleton />;
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            !
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Unable to load the market
          </h1>

          <p
            role="alert"
            className="mt-2 text-sm text-slate-500 dark:text-slate-400"
          >
            {error?.message || "Something went wrong while loading market data."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              LIVE MARKET
            </span>

            <span className="text-xs text-slate-400 dark:text-slate-500">
              Prices update automatically
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Market
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
            Monitor live price movements and explore assets available
            for trading.
          </p>
        </div>
      </section>

      {/* Market overview */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Assets
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {marketStats.totalAssets}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Available to trade
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Gainers
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {marketStats.gainers}
          </p>

          <p className="mt-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
            Moving up this tick
          </p>
        </div>

        <div className="rounded-2xl border border-red-200/70 bg-red-50/50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">
            Losers
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-400">
            {marketStats.losers}
          </p>

          <p className="mt-1 text-xs text-red-700/70 dark:text-red-400/70">
            Moving down this tick
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="market-search"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Search assets
            </label>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                ⌕
              </span>

              <input
                id="market-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or symbol..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div className="lg:w-64">
            <label
              htmlFor="market-sort"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Sort by
            </label>

            <select
              id="market-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="default">Default order</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="change-high">Change: Highest</option>
              <option value="change-low">Change: Lowest</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {visibleAssets.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {assets.length}
            </span>{" "}
            assets
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              Clear search
            </button>
          )}
        </div>
      </section>

      {/* Asset list */}
      <section aria-label="Market assets">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Assets
          </h2>

          <span className="hidden text-xs text-slate-400 sm:block dark:text-slate-500">
            Click an asset to trade
          </span>
        </div>

        {visibleAssets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800">
              🔎
            </div>

            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No assets found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try searching for a different asset name or symbol.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAssets.map((asset) => {
              const priceData = prices[asset.id];

              if (!priceData) {
                return (
                  <div
                    key={asset.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-white">
                          {asset.symbol}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {asset.name}
                        </p>
                      </div>

                      <span className="text-sm text-slate-400">
                        Price loading...
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  priceData={priceData}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Market;