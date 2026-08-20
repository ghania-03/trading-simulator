import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";
import { assets } from "../data/assets";
import {
  calculateHoldingFinancials,
} from "../utils/portfolioCalculations";

function HoldingsList() {
  const holdings = usePortfolioStore(
    (state) => state.holdings,
  );

  const { prices } = usePriceFeed();

  const holdingEntries =
    Object.entries(holdings);

  return (
    <section>
      <h2>My Holdings</h2>

      {holdingEntries.length === 0 ? (
        <p>No holdings yet.</p>
      ) : (
        <div>
          {holdingEntries.map(
            ([assetId, holding]) => {
              const asset = assets.find(
                (item) =>
                  item.id === assetId,
              );

              const priceData =
                prices[assetId];

              const quantity =
                Number(holding?.quantity) || 0;

              const averageBuyPrice =
                Number(
                  holding?.averageBuyPrice,
                ) || 0;

              /*
                Do not silently remove a holding from
                the UI just because market data is still
                loading.
              */
              if (!asset) {
                return (
                  <div key={assetId}>
                    <hr />

                    <h3>
                      {assetId.toUpperCase()}
                    </h3>

                    <p>
                      Asset information unavailable.
                    </p>

                    <p>
                      Quantity: {quantity}
                    </p>
                  </div>
                );
              }

              if (!priceData) {
                return (
                  <div key={assetId}>
                    <hr />

                    <h3>
                      {asset.symbol} -{" "}
                      {asset.name}
                    </h3>

                    <p>
                      Quantity: {quantity}{" "}
                      {asset.symbol}
                    </p>

                    <p>
                      Average Buy Price: $
                      {averageBuyPrice.toFixed(
                        2,
                      )}
                    </p>

                    <p>
                      Current price loading...
                    </p>
                  </div>
                );
              }

              const currentPrice =
                priceData.current;

              const {
                marketValue,
                costBasis,
                unrealizedPnl,
                unrealizedPnlPercentage,
              } =
                calculateHoldingFinancials(
                  quantity,
                  averageBuyPrice,
                  currentPrice,
                );

              return (
                <div key={assetId}>
                  <hr />

                  <h3>
                    {asset.symbol} -{" "}
                    {asset.name}
                  </h3>

                  <p>
                    Quantity:{" "}
                    {quantity} {asset.symbol}
                  </p>

                  <p>
                    Average Buy Price: $
                    {averageBuyPrice.toFixed(
                      2,
                    )}
                  </p>

                  <p>
                    Current Price: $
                    {currentPrice.toFixed(2)}
                  </p>

                  <p>
                    Market Value: $
                    {marketValue.toFixed(2)}
                  </p>

                  <p>
                    Cost Basis: $
                    {costBasis.toFixed(2)}
                  </p>

                  <p>
                    Unrealized P&L:{" "}
                    {unrealizedPnl >= 0
                      ? "+"
                      : ""}
                    $
                    {unrealizedPnl.toFixed(
                      2,
                    )}{" "}
                    (
                    {unrealizedPnlPercentage >=
                    0
                      ? "+"
                      : ""}
                    {unrealizedPnlPercentage.toFixed(
                      2,
                    )}
                    %)
                  </p>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default HoldingsList;