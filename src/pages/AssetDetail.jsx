import { useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../data/assets";
import usePriceFeed from "../hooks/usePriceFeed";
import usePortfolioStore from "../store/portfolioStore";
import { getPriceChange } from "../utils/priceChange";

function AssetDetail() {
  const { id } = useParams();

  const asset = assets.find((asset) => asset.id === id);

  const { prices } = usePriceFeed();

  const [quantity, setQuantity] = useState("");

  // Subscribe to portfolio state
  const cash = usePortfolioStore((state) => state.cash);
  const holdings = usePortfolioStore((state) => state.holdings);

  // Subscribe to portfolio actions/state
  const buy = usePortfolioStore((state) => state.buy);
  const sell = usePortfolioStore((state) => state.sell);
  const error = usePortfolioStore((state) => state.error);
  const clearError = usePortfolioStore((state) => state.clearError);

  if (!asset) {
    return <h1>Asset Not Found</h1>;
  }

  const priceData = prices[asset.id];

  if (!priceData) {
    return <p>Loading price...</p>;
  }

  const { change, percentage, direction } = getPriceChange(
    priceData.current,
    priceData.previous
  );

  const currentQuantity =
    holdings[asset.id]?.quantity || 0;

  const numericQuantity = Number(quantity) || 0;

  const estimatedTotal =
    numericQuantity * priceData.current;

  const holdingValue =
    currentQuantity * priceData.current;

  function handleQuantityChange(event) {
    setQuantity(event.target.value);

    if (error) {
      clearError();
    }
  }

  function handleBuy() {
    const result = buy(
      asset.id,
      numericQuantity,
      priceData.current
    );

    if (result.success) {
      setQuantity("");
    }
  }

  function handleSell() {
    const result = sell(
      asset.id,
      numericQuantity,
      priceData.current
    );

    if (result.success) {
      setQuantity("");
    }
  }

  return (
    <div>
      <h1>{asset.symbol}</h1>

      <p>{asset.name}</p>

      <hr />

      <h2>Market</h2>

      <p>
        Current Price: $
        {priceData.current.toFixed(2)}
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

      <hr />

      <h2>Portfolio</h2>

      <p>
        Available Cash: $
        {cash.toFixed(2)}
      </p>

      <p>
        {asset.symbol} Holding:{" "}
        {currentQuantity} {asset.symbol}
      </p>

      <p>
        Holding Value: $
        {holdingValue.toFixed(2)}
      </p>

      <hr />

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

      <p>
        Estimated Total: $
        {estimatedTotal.toFixed(2)}
      </p>

      <button
        onClick={handleBuy}
        disabled={numericQuantity <= 0}
      >
        BUY
      </button>

      <button
        onClick={handleSell}
        disabled={numericQuantity <= 0}
      >
        SELL
      </button>

      {error && (
        <p>
          {error}
        </p>
      )}
    </div>
  );
}

export default AssetDetail;