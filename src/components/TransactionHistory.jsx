import usePortfolioStore from "../store/portfolioStore";

function TransactionHistory() {
  const transactions =
    usePortfolioStore(
      (state) => state.transactions,
    );

  return (
    <section>
      <h2>Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <div>
          {[...transactions]
            .reverse()
            .map((transaction) => (
              <div key={transaction.id}>
                <hr />

                <p>
                  <strong>
                    {transaction.type}
                  </strong>
                </p>

                <p>
                  Asset:{" "}
                  {transaction.assetId.toUpperCase()}
                </p>

                <p>
                  Quantity:{" "}
                  {transaction.quantity}
                </p>

                <p>
                  Price: $
                  {transaction.price.toFixed(
                    2,
                  )}
                </p>

                <p>
                  Total: $
                  {transaction.total.toFixed(
                    2,
                  )}
                </p>

                <p>
                  Time:{" "}
                  {new Date(
                    transaction.timestamp,
                  ).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

export default TransactionHistory;