const QUANTITY_DECIMALS = 8;

export const roundQuantity = (quantity) => {
  return Number(quantity.toFixed(QUANTITY_DECIMALS));
};

export const calculateAverageBuyPrice = (
  oldQuantity,
  oldAverageBuyPrice,
  newQuantity,
  newPrice,
) => {
  if (oldQuantity <= 0) {
    return newPrice;
  }

  return (
    (oldQuantity * oldAverageBuyPrice +
      newQuantity * newPrice) /
    (oldQuantity + newQuantity)
  );
};

/*
  Reconstruct average-cost accounting from transactions.

  This is useful for:
  - calculating realized P&L
  - migrating older persisted transactions
  - keeping financial calculations derived from transaction history
*/
export const calculateFinancialsFromTransactions = (
  transactions = [],
) => {
  const positions = {};
  let realizedPnl = 0;

  for (const transaction of transactions) {
    const {
      assetId,
      type,
      quantity,
      price,
    } = transaction;

    if (
      !assetId ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      continue;
    }

    const position = positions[assetId] || {
      quantity: 0,
      averageBuyPrice: 0,
    };

    if (type === "BUY") {
      const newQuantity = roundQuantity(
        position.quantity + quantity,
      );

      const newAverageBuyPrice =
        position.quantity === 0
          ? price
          : calculateAverageBuyPrice(
              position.quantity,
              position.averageBuyPrice,
              quantity,
              price,
            );

      positions[assetId] = {
        quantity: newQuantity,
        averageBuyPrice: newAverageBuyPrice,
      };
    }

    if (type === "SELL") {
      const quantitySold = Math.min(
        quantity,
        position.quantity,
      );

      if (quantitySold <= 0) {
        continue;
      }

      const costBasis =
        quantitySold * position.averageBuyPrice;

      const saleProceeds =
        quantitySold * price;

      realizedPnl += saleProceeds - costBasis;

      const remainingQuantity = roundQuantity(
        position.quantity - quantitySold,
      );

      positions[assetId] = {
        quantity: remainingQuantity,
        averageBuyPrice:
          remainingQuantity > 0
            ? position.averageBuyPrice
            : 0,
      };
    }
  }

  return {
    positions,
    realizedPnl,
  };
};

export const calculateHoldingFinancials = (
  quantity,
  averageBuyPrice,
  currentPrice,
) => {
  const safeQuantity =
    Number.isFinite(quantity) && quantity > 0
      ? quantity
      : 0;

  const safeAverageBuyPrice =
    Number.isFinite(averageBuyPrice) &&
    averageBuyPrice > 0
      ? averageBuyPrice
      : 0;

  const safeCurrentPrice =
    Number.isFinite(currentPrice) &&
    currentPrice >= 0
      ? currentPrice
      : 0;

  const marketValue =
    safeQuantity * safeCurrentPrice;

  const costBasis =
    safeQuantity * safeAverageBuyPrice;

  const unrealizedPnl =
    marketValue - costBasis;

  const unrealizedPnlPercentage =
    costBasis > 0
      ? (unrealizedPnl / costBasis) * 100
      : 0;

  return {
    marketValue,
    costBasis,
    unrealizedPnl,
    unrealizedPnlPercentage,
  };
};

export const calculatePortfolioFinancials = ({
  cash,
  holdings,
  prices,
  transactions,
}) => {
  let holdingsValue = 0;
  let remainingCostBasis = 0;

  for (const [assetId, holding] of Object.entries(
    holdings || {},
  )) {
    const currentPrice =
      prices[assetId]?.current || 0;

    const financials =
      calculateHoldingFinancials(
        holding.quantity,
        holding.averageBuyPrice,
        currentPrice,
      );

    holdingsValue += financials.marketValue;
    remainingCostBasis += financials.costBasis;
  }

  const portfolioValue =
    cash + holdingsValue;

  const {
    realizedPnl,
  } =
    calculateFinancialsFromTransactions(
      transactions,
    );

  const unrealizedPnl =
    holdingsValue - remainingCostBasis;

  const totalPnl =
    realizedPnl + unrealizedPnl;

  const startingCapital = 10000;

  const totalPnlPercentage =
    startingCapital > 0
      ? (totalPnl / startingCapital) * 100
      : 0;

  return {
    holdingsValue,
    remainingCostBasis,
    portfolioValue,
    realizedPnl,
    unrealizedPnl,
    totalPnl,
    totalPnlPercentage,
  };
};