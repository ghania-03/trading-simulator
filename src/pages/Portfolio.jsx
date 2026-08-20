import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";
import TransactionHistory from "../components/TransactionHistory";

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

      <TransactionHistory />
    </div>
  );
}

export default Portfolio;