import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { getPriceChange } from "../utils/priceChange";
import Sparkline from "./Sparkline";

function AssetCard({ asset, priceData }) {
  const priceElementRef = useRef(null);
  const previousPriceRef = useRef(priceData.current);
  const animationRef = useRef(null);

  useEffect(() => {
    const currentPrice = priceData.current;
    const previousPrice = previousPriceRef.current;
    const priceElement = priceElementRef.current;

    if (
      priceElement &&
      currentPrice !== previousPrice
    ) {
      animationRef.current?.cancel();

      const flashColor =
        currentPrice > previousPrice
          ? "rgba(34, 197, 94, 0.25)"
          : "rgba(239, 68, 68, 0.25)";

      animationRef.current = priceElement.animate(
        [
          {
            backgroundColor: flashColor,
          },
          {
            backgroundColor: "transparent",
          },
        ],
        {
          duration: 500,
          easing: "ease-out",
        },
      );
    }

    previousPriceRef.current = currentPrice;

    return () => {
      animationRef.current?.cancel();
    };
  }, [priceData.current]);

  const {
    change,
    percentage,
    direction,
  } = getPriceChange(
    priceData.current,
    priceData.previous,
  );

  const isPositive = change >= 0;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Asset identity */}
        <Link
          to={`/app/asset/${asset.id}`}
          className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold tracking-wide text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-300">
              {asset.symbol.slice(0, 3)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-900 dark:text-white">
                {asset.symbol}
              </h2>

              <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                {asset.name}
              </p>
            </div>
          </div>
        </Link>

        {/* Sparkline */}
        <div className="hidden shrink-0 sm:block">
          <Sparkline
            history={priceData.history}
            direction={direction}
          />
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <p
            ref={priceElementRef}
            className="rounded-lg px-1 py-1 text-sm font-bold tabular-nums text-slate-900 sm:text-base dark:text-white"
          >
            ${priceData.current.toFixed(2)}
          </p>

          <div
            className={`mt-1 flex items-center justify-end gap-1 text-xs font-semibold tabular-nums ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <span>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}
            </span>

            <span className="text-slate-300 dark:text-slate-700">
              |
            </span>

            <span>
              {percentage >= 0 ? "+" : ""}
              {percentage.toFixed(3)}%
            </span>
          </div>
        </div>

        {/* Direction indicator */}
        <Link
          to={`/app/asset/${asset.id}`}
          aria-label={`View ${asset.symbol} details`}
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition sm:flex ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:group-hover:bg-emerald-950/70"
              : "bg-red-50 text-red-600 group-hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:group-hover:bg-red-950/70"
          }`}
        >
          {isPositive ? "↗" : "↘"}
        </Link>
      </div>

      {/* Mobile sparkline */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:hidden dark:border-slate-800">
        <span
          className={`text-xs font-semibold ${
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {direction === "up" ? "▲ Rising" : "▼ Falling"}
        </span>

        <Sparkline
          history={priceData.history}
          direction={direction}
        />
      </div>
    </article>
  );
}

export default AssetCard;