import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { useAsset } from "../hooks/useAssets";
import usePriceFeed from "../hooks/usePriceFeed";
import usePortfolioStore from "../store/portfolioStore";
import { getPriceChange } from "../utils/priceChange";
import { roundQuantity } from "../utils/portfolioCalculations";
import PriceChart from "../components/PriceChart";
import AuthContext from "../context/AuthContext";
import { createTransaction } from "../services/transactionService";
import { useNotifications } from "../context/NotificationContext";
import PriceAlertControls from "../components/PriceAlertControls";

function AssetDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const { mutateAsync: saveTransaction } = useMutation({
    mutationFn: createTransaction,
  });

  const {
    data: asset,
    isLoading,
    isError,
    error: assetError,
    refetch,
  } = useAsset(id);

  const { success, error: showNotification } =
    useNotifications();

  const error = usePortfolioStore(
    (state) => state.error,
  );

  const { prices } = usePriceFeed();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: "",
    },
  });

  const quantity = watch("quantity");

  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const rollbackTransaction =
    usePortfolioStore(
      (state) => state.rollbackTransaction,
    );

  const cash = usePortfolioStore(
    (state) => state.cash,
  );

  const holdings = usePortfolioStore(
    (state) => state.holdings,
  );

  const buy = usePortfolioStore(
    (state) => state.buy,
  );

  const sell = usePortfolioStore(
    (state) => state.sell,
  );

  const clearError = usePortfolioStore(
    (state) => state.clearError,
  );

  useEffect(() => {
    if (error) {
      showNotification(error);
    }
  }, [error, showNotification]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-48 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-900" />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-900" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-900" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Unable to load asset
          </h1>

          <p
            role="alert"
            className="mt-2 text-sm text-slate-500 dark:text-slate-400"
          >
            {assetError?.message ||
              "Something went wrong while loading this asset."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Asset Not Found
        </h1>

        <Link
          to="/app/market"
          className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Back to Market
        </Link>
      </section>
    );
  }

  const priceData = prices[asset.id];

  if (!priceData) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading price...
        </p>
      </div>
    );
  }

  const {
    change,
    percentage,
    direction,
  } = getPriceChange(
    priceData.current,
    priceData.previous,
  );

  const isPositive = change >= 0;

  const currentQuantity =
    holdings[asset.id]?.quantity || 0;

  const currentPrice = priceData.current;

  const numericQuantity =
    Number(quantity) || 0;

  const estimatedTotal =
    numericQuantity * currentPrice;

  const holdingValue =
    currentQuantity * currentPrice;

  const maxBuyQuantity =
    currentPrice > 0
      ? roundQuantity(cash / currentPrice)
      : 0;

  function handleMax() {
    clearError();

    setValue(
      "quantity",
      String(
        currentQuantity > 0
          ? currentQuantity
          : maxBuyQuantity,
      ),
      {
        shouldValidate: true,
      },
    );
  }

  async function handleBuy(data) {
    if (submittingRef.current || !user) {
      return;
    }

    const tradeQuantity = Number(
      data.quantity,
    );

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = buy(
  asset.id,
  tradeQuantity,
  currentPrice,
  String(user.id),
);

      if (!result?.success) {
        return;
      }

      try {
        await saveTransaction({
          ...result.transaction,
          userId: user.id,
        });

        reset();

        success(
          `Bought ${tradeQuantity} ${asset.symbol} for $${result.transaction.total.toFixed(2)}.`,
        );
      } catch (syncError) {
        rollbackTransaction(
          result.transaction.id,
        );

        showNotification(
          "Trade could not be saved. Your BUY was reverted.",
        );

        console.error(
          "Failed to sync transaction:",
          syncError,
        );
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleSell(data) {
    if (submittingRef.current || !user) {
      return;
    }

    const tradeQuantity = Number(
      data.quantity,
    );

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = sell(
  asset.id,
  tradeQuantity,
  currentPrice,
  String(user.id),
);

      if (!result?.success) {
        return;
      }

      try {
        await saveTransaction({
          ...result.transaction,
          userId: user.id,
        });

        reset();

        success(
          `Sold ${tradeQuantity} ${asset.symbol} for $${result.transaction.total.toFixed(2)}.`,
        );
      } catch (syncError) {
        rollbackTransaction(
          result.transaction.id,
        );

        showNotification(
          "Trade could not be saved. Your SELL was reverted.",
        );

        console.error(
          "Failed to sync transaction:",
          syncError,
        );
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/app/market"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-400 dark:hover:text-white"
      >
        <span aria-hidden="true">←</span>
        Back to Market
      </Link>

      {/* Asset header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-700 dark:bg-slate-800 dark:text-white">
              {asset.symbol.slice(0, 3)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                  {asset.symbol}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}
                >
                  {direction === "up"
                    ? "Rising"
                    : "Falling"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {asset.name}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current Price
            </p>

            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-950 dark:text-white">
              ${currentPrice.toFixed(2)}
            </p>

            <p
              className={`mt-1 text-sm font-semibold tabular-nums ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}
              {"  "}
              ({percentage >= 0 ? "+" : ""}
              {percentage.toFixed(3)}%)
            </p>
          </div>
        </div>
      </section>

      {/* Market stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Price
          </p>

          <p className="mt-2 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
            ${currentPrice.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Change
          </p>

          <p
            className={`mt-2 text-lg font-bold tabular-nums ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Movement
          </p>

          <p
            className={`mt-2 text-lg font-bold capitalize ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {direction}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            History
          </p>

          <p className="mt-2 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
            {priceData.history.length}
          </p>

          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            data points
          </p>
        </div>
      </section>

      {/* Main chart */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Price History
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Live simulated price movement
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <div className="p-3 sm:p-5">
          <PriceChart history={priceData.history} />
        </div>
      </section>

      {/* Portfolio + Alert */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio position */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Your Position
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Current portfolio position in {asset.symbol}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              $
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available Cash
              </p>

              <p className="mt-2 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                ${cash.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quantity Held
              </p>

              <p className="mt-2 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                {currentQuantity}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Current Holding Value
              </p>

              <p className="mt-2 text-2xl font-bold tabular-nums text-indigo-700 dark:text-indigo-300">
                ${holdingValue.toFixed(2)}
              </p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Price Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Get notified when {asset.symbol} crosses your target.
            </p>
          </div>

          <PriceAlertControls asset={asset} />
        </section>
      </div>

      {/* Trading section */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Trade {asset.symbol}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter a quantity and choose whether to buy or sell.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              ${currentPrice.toFixed(2)} / {asset.symbol}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="p-5 sm:p-6">
            <form>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="quantity"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Quantity
                  </label>

                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {currentQuantity > 0
                      ? `${currentQuantity} held`
                      : "No position"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Enter quantity"
                    disabled={isSubmitting}
                    {...register("quantity", {
                      required:
                        "Please enter a quantity.",
                      validate: (value) => {
                        const numericValue =
                          Number(value);

                        if (
                          !Number.isFinite(
                            numericValue,
                          ) ||
                          numericValue <= 0
                        ) {
                          return "Quantity must be greater than 0.";
                        }

                        return true;
                      },
                      onChange: () => {
                        if (error) {
                          clearError();
                        }
                      },
                    })}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold tabular-nums text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950"
                  />

                  <button
                    type="button"
                    onClick={handleMax}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    MAX
                  </button>
                </div>

                {errors.quantity && (
                  <p
                    role="alert"
                    className="mt-2 text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Estimated total */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Estimated total
                  </span>

                  <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>Quantity</span>
                  <span className="tabular-nums">
                    {numericQuantity}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>Market price</span>
                  <span className="tabular-nums">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buy / Sell */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSubmit(handleBuy)}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
                >
                  {isSubmitting
                    ? "Processing..."
                    : "BUY"}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit(handleSell)}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-red-600 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
                >
                  {isSubmitting
                    ? "Processing..."
                    : "SELL"}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Order summary */}
          <aside className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Order Summary
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Side
                </span>

                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  BUY / SELL
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Asset
                </span>

                <span className="font-semibold text-slate-900 dark:text-white">
                  {asset.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Quantity
                </span>

                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  {numericQuantity}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Price
                </span>

                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Value
                  </span>

                  <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-400 dark:text-slate-500">
              Orders execute using the current simulated market
              price.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default AssetDetail;