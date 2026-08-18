import { useReducer } from "react";
import {
  initialPortfolio,
  portfolioReducer,
} from "../reducers/portfolioReducer";
import usePriceFeed from "../hooks/usePriceFeed";
function Portfolio() {
  const [portfolio, dispatch] = useReducer(portfolioReducer, initialPortfolio);
  const { prices } = usePriceFeed();
  
const holdingsValue = Object.entries(portfolio.holdings).reduce(
  (total, [assetId, holding]) => {
    const currentPrice = prices[assetId]?.current || 0;

    return total + holding.quantity * currentPrice;
  },
  0
);

const portfolioValue = portfolio.cash + holdingsValue;

const startingCapital = 10000;

const profitLoss = portfolioValue - startingCapital;

const profitLossPercentage =
  (profitLoss / startingCapital) * 100;
  return (
    <div>
  <h1>Portfolio</h1>

  <div>
    <p>Cash</p>
    <strong>${portfolio.cash.toFixed(2)}</strong>
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
      {profitLoss >= 0 ? "+" : ""}
      ${profitLoss.toFixed(2)}
    </strong>

    <span>
      {" "}
      ({profitLossPercentage.toFixed(2)}%)
    </span>
  </div>
</div>
  );
}

export default Portfolio;
