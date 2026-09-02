import { useForm } from "react-hook-form";
import usePriceAlert from "../hooks/usePriceAlert";

function PriceAlertControls({ asset }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      threshold: "",
      direction: "above",
    },
  });

  const alertThreshold = watch("threshold");
  const alertDirection = watch("direction");

  const {
    isActive,
    enableAlert,
    disableAlert,
  } = usePriceAlert(
    asset.id,
    alertThreshold,
    alertDirection,
    asset.symbol,
  );

  function handleEnableAlert(data) {
    enableAlert();
  }

  function handleDisableAlert() {
    disableAlert();
    reset();
  }

  return (
    <section>
      <h2>Price Alert</h2>

      {!isActive ? (
        <form onSubmit={handleSubmit(handleEnableAlert)}>
          <label>
            Alert when price goes{" "}
            <select
              {...register("direction")}
            >
              <option value="above">
                above
              </option>

              <option value="below">
                below
              </option>
            </select>
          </label>

          <br />

          <label>
            Threshold: $

            <input
              type="number"
              min="0"
              step="any"
              placeholder="Enter price"
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
            />
          </label>

          {errors.threshold && (
            <p role="alert">
              {errors.threshold.message}
            </p>
          )}

          <div>
            <button type="submit">
              Set Alert
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>
            Alert is active: notify when{" "}
            {asset.symbol} goes{" "}
            {alertDirection} $
            {Number(
              alertThreshold,
            ).toFixed(2)}.
          </p>

          <button
            type="button"
            onClick={handleDisableAlert}
          >
            Remove Alert
          </button>
        </>
      )}
    </section>
  );
}

export default PriceAlertControls;