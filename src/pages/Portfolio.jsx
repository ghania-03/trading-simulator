import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";

function Portfolio() {
  const { prices } = usePriceFeed();

  const cash = usePortfolioStore((state) => state.cash);
  const holdings = usePortfolioStore((state) => state.holdings);

  const holdingsValue = Object.entries(holdings).reduce(
    (total, [assetId, holding]) => {
      const currentPrice = prices[assetId]?.current || 0;

      return total + holding.quantity * currentPrice;
    },
    0,
  );

  const portfolioValue = cash + holdingsValue;

  const startingCapital = 10000;

  const profitLoss = portfolioValue - startingCapital;

  const profitLossPercentage = (profitLoss / startingCapital) * 100;

  const transactions = usePortfolioStore((state) => state.transactions);

  const buy = usePortfolioStore((state) => state.buy);
  function handleTestBuy() {
    const price = prices.btc.current;

    buy("btc", 0.1, price);
  }

  return (
    <div>
      <h1>Portfolio</h1>

      <div>
        <p>Cash</p>
        <strong>${cash.toFixed(2)}</strong>
      </div>

      <div>
        <p>Holdings Value</p>
        <strong>${holdingsValue.toFixed(2)}</strong>
      </div>

      <div>
        <p>Portfolio Value</p>
        <strong>${portfolioValue.toFixed(2)}</strong>
      </div>

      <div>
        <p>P&L</p>
        <strong>
          {profitLoss >= 0 ? "+" : ""}${profitLoss.toFixed(2)}
        </strong>
        <span> ({profitLossPercentage.toFixed(2)}%)</span>
      </div>

      <div>
        <button onClick={handleTestBuy}>Test Buy 0.1 BTC</button>
        <p>BTC: {holdings.btc?.quantity ?? 0}</p>
      </div>

      <pre>{JSON.stringify(transactions, null, 2)}</pre>
      
    </div>
  );
}

export default Portfolio;
