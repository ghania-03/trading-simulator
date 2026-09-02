import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getPriceChange } from "../utils/priceChange";

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
          { backgroundColor: flashColor },
          { backgroundColor: "transparent" },
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

  return (
    <div>
      <Link to={`/app/asset/${asset.id}`}>
        <h2>{asset.symbol}</h2>
      </Link>

      <p>{asset.name}</p>

      <p ref={priceElementRef}>
        ${priceData.current.toFixed(2)}
      </p>

      <p>
        {change >= 0 ? "+" : ""}
        {change.toFixed(2)}
      </p>

      <p>
        {percentage >= 0 ? "+" : ""}
        {percentage.toFixed(3)}%
      </p>

      <p>
        {direction}
      </p>
    </div>
  );
}

export default AssetCard;