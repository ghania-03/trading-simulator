import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { getPriceChange } from "../utils/priceChange";
import Sparkline from "./Sparkline";

function AssetCard({ asset, priceData }) {
  const priceElementRef = useRef(null);
  const previousPriceRef = useRef(
    priceData.current,
  );
  const animationRef = useRef(null);

  useEffect(() => {
    const currentPrice = priceData.current;
    const previousPrice =
      previousPriceRef.current;

    const priceElement =
      priceElementRef.current;

    if (
      priceElement &&
      currentPrice !== previousPrice
    ) {
      animationRef.current?.cancel();

      const flashColor =
        currentPrice > previousPrice
          ? "rgba(34, 197, 94, 0.25)"
          : "rgba(239, 68, 68, 0.25)";

      animationRef.current =
        priceElement.animate(
          [
            {
              backgroundColor: flashColor,
            },
            {
              backgroundColor:
                "transparent",
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <Link
          to={`/app/asset/${asset.id}`}
          className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
              {asset.symbol.slice(0, 3)}
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {asset.symbol}
              </h2>

              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {asset.name}
              </p>
            </div>
          </div>
        </Link>

        <Sparkline
          history={priceData.history}
          direction={direction}
        />

        <div className="min-w-[120px] text-right">
          <p
            ref={priceElementRef}
            className="rounded-lg px-2 py-1 text-sm font-bold text-slate-900 dark:text-white"
          >
            ${priceData.current.toFixed(2)}
          </p>

          <div
            className={`mt-1 text-xs font-semibold ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <span>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}
            </span>

            <span className="ml-2">
              {percentage >= 0 ? "+" : ""}
              {percentage.toFixed(3)}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AssetCard;