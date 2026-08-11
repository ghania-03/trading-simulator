import { Link } from "react-router-dom";
import { getPriceChange } from "../utils/priceChange";

function AssetCard({ asset, priceData }) {
  const { change, percentage, direction } = getPriceChange(
    priceData.current,
    priceData.previous,
  );
   return (
    <div>
      <Link to={`/app/asset/${asset.id}`}>
        <h2>{asset.symbol}</h2>
      </Link>

      <p>{asset.name}</p>

      <p>
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
