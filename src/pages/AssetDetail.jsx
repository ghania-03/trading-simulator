import {
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { assets } from "../data/assets";
import usePriceFeed from "../hooks/usePriceFeed";
import usePortfolioStore from "../store/portfolioStore";
import { getPriceChange } from "../utils/priceChange";
import { roundQuantity } from "../utils/portfolioCalculations";
import PriceChart from "../components/PriceChart";

function AssetDetail() {
  const { id } = useParams();

  const asset = assets.find(
    (item) => item.id === id,
  );

  const { prices } = usePriceFeed();

  const [quantity, setQuantity] =
    useState("");

  const submittingRef = useRef(false);

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

  const error = usePortfolioStore(
    (state) => state.error,
  );

  const clearError =
    usePortfolioStore(
      (state) => state.clearError,
    );

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

  function handleQuantityChange(
    event,
  ) {
    setQuantity(event.target.value);

    if (error) {
      clearError();
    }
  }

  function handleMax() {
    clearError();

    setQuantity(
      String(
        currentQuantity > 0
          ? currentQuantity
          : maxBuyQuantity,
      ),
    );
  }

  function handleBuy() {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    try {
      const result = buy(
        asset.id,
        numericQuantity,
        currentPrice,
      );

      if (result?.success) {
        setQuantity("");
      }
    } finally {
      submittingRef.current = false;
    }
  }

  function handleSell() {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    try {
      const result = sell(
        asset.id,
        numericQuantity,
        currentPrice,
      );

      if (result?.success) {
        setQuantity("");
      }
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <div>
      <h1>{asset.symbol}</h1>

      <p>{asset.name}</p>

      <hr />

      <section>
        <h2>Market</h2>

        <p>Current Price: ${currentPrice.toFixed(2)}</p>

        <p>
          Change: {change >= 0 ? "+" : ""}
          {change.toFixed(2)}
        </p>

        <p>
          Percentage: {percentage >= 0 ? "+" : ""}
          {percentage.toFixed(3)}%
        </p>

        <p>Direction: {direction}</p>
      </section>
      <hr />

      <PriceChart history={priceData.history} />

      <hr />

      <section>
        <h2>Portfolio</h2>

        <p>Available Cash: ${cash.toFixed(2)}</p>

        <p>
          Available Quantity: {currentQuantity} {asset.symbol}
        </p>

        <p>Holding Value: ${holdingValue.toFixed(2)}</p>
      </section>

      <hr />

      <section>
        <h2>Trade {asset.symbol}</h2>

        <label>
          Quantity:
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="Enter quantity"
          />
        </label>

        <button type="button" onClick={handleMax}>
          MAX
        </button>

        <p>Estimated Total: ${estimatedTotal.toFixed(2)}</p>

        <div>
          <button
            type="button"
            onClick={handleBuy}
            disabled={submittingRef.current}
          >
            BUY
          </button>

          <button
            type="button"
            onClick={handleSell}
            disabled={submittingRef.current}
          >
            SELL
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

        <div>
          <h3>Order Summary</h3>

          <p>Side: {currentQuantity > 0 ? "BUY / SELL" : "BUY"}</p>

          <p>Asset: {asset.symbol}</p>

          <p>Quantity: {numericQuantity}</p>

          <p>Price: ${currentPrice.toFixed(2)}</p>

          <p>Estimated Value: ${estimatedTotal.toFixed(2)}</p>
        </div>
      </section>
    </div>
  );
}

export default AssetDetail;