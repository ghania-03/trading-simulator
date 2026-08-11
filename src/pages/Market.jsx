import { assets } from "../data/assets";
import usePriceFeed from "../hooks/usePriceFeed";
import AssetCard from "../components/AssetCard";

function Market() {
  const {prices} = usePriceFeed();

  return (
    <div>
      <h1>Market</h1>

      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          priceData={prices[asset.id]}
        />
      ))}

    </div>
  );
}

export default Market;
