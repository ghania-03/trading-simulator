import { useForm } from "react-hook-form";

import usePriceAlert from "../hooks/usePriceAlert";

function PriceAlertControls({ asset }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      threshold: "",
      direction: "above",
    },
  });

  const {
    alerts,
    enableAlert,
    disableAlert,
  } = usePriceAlert(
    asset.id,
    asset.symbol,
  );

  function handleEnableAlert(data) {
    const alertId = enableAlert({
      threshold: data.threshold,
      direction: data.direction,
    });

    if (alertId) {
      reset({
        threshold: "",
        direction: "above",
      });
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Price Alerts
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get notified when {asset.symbol} crosses
          your selected price.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleEnableAlert)}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="alert-direction"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Alert direction
          </label>

          <select
            id="alert-direction"
            {...register("direction")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="above">
              Price goes above
            </option>

            <option value="below">
              Price goes below
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="alert-threshold"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Threshold
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>

            <input
              id="alert-threshold"
              type="number"
              min="0"
              step="any"
              placeholder="Enter target price"
              {...register("threshold", {
                required:
                  "Please enter a price threshold.",

                validate: (value) => {
                  const numericValue =
                    Number(value);

                  if (
                    !Number.isFinite(
                      numericValue,
                    ) ||
                    numericValue <= 0
                  ) {
                    return "Threshold must be greater than 0.";
                  }

                  return true;
                },
              })}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {errors.threshold && (
            <p
              role="alert"
              className="mt-1.5 text-xs text-red-500"
            >
              {errors.threshold.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Set Price Alert
        </button>
      </form>

      <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Active Alerts
          </h3>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {alerts.length}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No active alerts for{" "}
              {asset.symbol}.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {alert.direction === "above"
                      ? "Above"
                      : "Below"}{" "}
                    ${alert.threshold.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {asset.symbol} price alert
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    disableAlert(alert.id)
                  }
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PriceAlertControls;