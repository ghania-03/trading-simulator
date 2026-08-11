import { useParams } from "react-router-dom";
import { assets } from "../data/assets";
import usePriceFeed from "../hooks/usePriceFeed";
import { getPriceChange } from "../utils/priceChange";

function AssetDetail() {
  const { id } = useParams();

  const asset = assets.find((asset) => asset.id === id);

  const { prices } = usePriceFeed();

  const priceData = prices[asset.id];

const { change, percentage, direction } = getPriceChange(
  priceData.current,
  priceData.previous
);

  if (!asset) {
    return <h1>Asset Not Found</h1>;
  }

  return (
    <div>
      <h1>{asset.symbol}</h1>

      <p>{asset.name}</p>

      <p>
  ${priceData.current.toFixed(2)}
</p>

<p>
  Change: {change >= 0 ? "+" : ""}
  {change.toFixed(2)}
</p>

<p>
  Change: {percentage >= 0 ? "+" : ""}
  {percentage.toFixed(3)}%
</p>

<p>
  Direction: {direction}
</p>

    </div>
  );
}

export default AssetDetail;