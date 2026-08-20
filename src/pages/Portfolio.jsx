import usePortfolioStore from "../store/portfolioStore";
import usePriceFeed from "../hooks/usePriceFeed";
import HoldingsList from "../components/HoldingsList";
import TransactionHistory from "../components/TransactionHistory";
import {
  calculatePortfolioFinancials,
} from "../utils/portfolioCalculations";

function Portfolio() {
  const { prices } = usePriceFeed();

  const cash = usePortfolioStore(
    (state) => state.cash,
  );

  const holdings = usePortfolioStore(
    (state) => state.holdings,
  );

  const transactions =
    usePortfolioStore(
      (state) => state.transactions,
    );

  const {
    holdingsValue,
    portfolioValue,
    realizedPnl,
    unrealizedPnl,
    totalPnl,
    totalPnlPercentage,
  } =
    calculatePortfolioFinancials({
      cash,
      holdings,
      prices,
      transactions,
    });

  return (
    <div>
      <h1>Portfolio</h1>

      <section>
        <h2>Summary</h2>

        <div>
          <p>Cash</p>

          <strong>
            ${cash.toFixed(2)}
          </strong>
        </div>

        <div>
          <p>Holdings Value</p>

          <strong>
            ${holdingsValue.toFixed(2)}
          </strong>
        </div>

        <div>
          <p>Portfolio Value</p>

          <strong>
            ${portfolioValue.toFixed(2)}
          </strong>
        </div>

        <div>
          <p>Unrealized P&L</p>

          <strong>
            {unrealizedPnl >= 0
              ? "+"
              : ""}
            ${unrealizedPnl.toFixed(2)}
          </strong>
        </div>

        <div>
          <p>Realized P&L</p>

          <strong>
            {realizedPnl >= 0
              ? "+"
              : ""}
            ${realizedPnl.toFixed(2)}
          </strong>
        </div>

        <div>
          <p>Total P&L</p>

          <strong>
            {totalPnl >= 0
              ? "+"
              : ""}
            ${totalPnl.toFixed(2)}
          </strong>

          <span>
            {" "}
            (
            {totalPnlPercentage >= 0
              ? "+"
              : ""}
            {totalPnlPercentage.toFixed(2)}
            %)
          </span>
        </div>
      </section>

      <HoldingsList />

      <TransactionHistory />
    </div>
  );
}

export default Portfolio;