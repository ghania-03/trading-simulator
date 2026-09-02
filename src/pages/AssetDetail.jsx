import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { useAsset } from "../hooks/useAssets";
import usePriceFeed from "../hooks/usePriceFeed";
import usePortfolioStore from "../store/portfolioStore";
import { getPriceChange } from "../utils/priceChange";
import { roundQuantity } from "../utils/portfolioCalculations";
import PriceChart from "../components/PriceChart";
import AuthContext from "../context/AuthContext";
import {
  createTransaction,
} from "../services/transactionService";

import { useNotifications } from "../context/NotificationContext";
import PriceAlertControls from "../components/PriceAlertControls";

function AssetDetail() {
  const { id } = useParams();

  const { user } =
    useContext(AuthContext);

  const {
    mutateAsync: saveTransaction,
  } = useMutation({
    mutationFn: createTransaction,
  });

  const {
    data: asset,
    isLoading,
    isError,
    error: assetError,
    refetch,
  } = useAsset(id);

  const {
    success,
    error: showNotification,
  } = useNotifications();

  const error = usePortfolioStore(
    (state) => state.error,
  );

  useEffect(() => {
    if (error) {
      showNotification(error);
    }
  }, [error, showNotification]);

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
      (state) =>
        state.rollbackTransaction,
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

  const clearError =
    usePortfolioStore(
      (state) => state.clearError,
    );

  if (isLoading) {
    return <p>Loading asset...</p>;
  }

  if (isError) {
    return (
      <section>
        <h1>Asset</h1>

        <p role="alert">
          Failed to load asset.
        </p>

        <p>
          {assetError?.message ||
            "Something went wrong."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!asset) {
    return <h1>Asset Not Found</h1>;
  }

  const priceData = prices[asset.id];

  if (!priceData) {
    return <p>Loading price...</p>;
  }

  const {
    change,
    percentage,
    direction,
  } = getPriceChange(
    priceData.current,
    priceData.previous,
  );

  const currentQuantity =
    holdings[asset.id]?.quantity || 0;

  const currentPrice =
    priceData.current;

  const numericQuantity =
    Number(quantity) || 0;

  const estimatedTotal =
    numericQuantity * currentPrice;

  const holdingValue =
    currentQuantity * currentPrice;

  const maxBuyQuantity =
    currentPrice > 0
      ? roundQuantity(
          cash / currentPrice,
        )
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
    if (
      submittingRef.current ||
      !user
    ) {
      return;
    }

    const tradeQuantity =
      Number(data.quantity);

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = buy(
        asset.id,
        tradeQuantity,
        currentPrice,
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
    if (
      submittingRef.current ||
      !user
    ) {
      return;
    }

    const tradeQuantity =
      Number(data.quantity);

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = sell(
        asset.id,
        tradeQuantity,
        currentPrice,
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
    <div>
      <h1>{asset.symbol}</h1>

      <p>{asset.name}</p>

      <hr />

      <section>
        <h2>Market</h2>

        <p>
          Current Price: $
          {currentPrice.toFixed(2)}
        </p>

        <p>
          Change:{" "}
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}
        </p>

        <p>
          Percentage:{" "}
          {percentage >= 0 ? "+" : ""}
          {percentage.toFixed(3)}%
        </p>

        <p>
          Direction: {direction}
        </p>
      </section>

      <hr />

      <PriceChart
        history={priceData.history}
      />

      <hr />

      <PriceAlertControls
        asset={asset}
      />

      <hr />

      <section>
        <h2>Portfolio</h2>

        <p>
          Available Cash: $
          {cash.toFixed(2)}
        </p>

        <p>
          Available Quantity:{" "}
          {currentQuantity}{" "}
          {asset.symbol}
        </p>

        <p>
          Holding Value: $
          {holdingValue.toFixed(2)}
        </p>
      </section>

      <hr />

      <section>
        <h2>
          Trade {asset.symbol}
        </h2>

        <form>
          <label htmlFor="quantity">
            Quantity:
          </label>

          <input
            id="quantity"
            type="number"
            min="0"
            step="any"
            placeholder="Enter quantity"
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
          />

          <button
            type="button"
            onClick={handleMax}
            disabled={isSubmitting}
          >
            MAX
          </button>

          {errors.quantity && (
            <p role="alert">
              {errors.quantity.message}
            </p>
          )}

          <p>
            Estimated Total: $
            {estimatedTotal.toFixed(2)}
          </p>

          <div>
            <button
              type="button"
              onClick={handleSubmit(handleBuy)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : "BUY"}
            </button>

            <button
              type="button"
              onClick={handleSubmit(handleSell)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : "SELL"}
            </button>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                color: "red",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}
        </form>

        <div>
          <h3>Order Summary</h3>

          <p>
            Side:{" "}
            {currentQuantity > 0
              ? "BUY / SELL"
              : "BUY"}
          </p>

          <p>
            Asset: {asset.symbol}
          </p>

          <p>
            Quantity:{" "}
            {numericQuantity}
          </p>

          <p>
            Price: $
            {currentPrice.toFixed(2)}
          </p>

          <p>
            Estimated Value: $
            {estimatedTotal.toFixed(2)}
          </p>
        </div>
      </section>
    </div>
  );
}

export default AssetDetail;