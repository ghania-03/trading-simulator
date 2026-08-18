export const initialPortfolio = {
  cash: 10000,
  holdings: {},
  transactions: [],
};

export function portfolioReducer(state, action) {
  switch (action.type) {
    case "DEPOSIT":
      return {
        ...state,
        cash: state.cash + action.amount,
      };
    case "WITHDRAW":
      return {
        ...state,
        cash: state.cash - action.amount,
      };
    case "ADD_HOLDING": {
      const { assetId, quantity } = action;

      const existingHolding = state.holdings[assetId];

      return {
        ...state,
        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: (existingHolding?.quantity || 0) + quantity,
          },
        },
      };
    }
    case "REMOVE_HOLDING": {
      const { assetId, quantity } = action;

      const existingHolding = state.holdings[assetId];

      if (!existingHolding) {
        return state;
      }

      const newQuantity = existingHolding.quantity - quantity;

      if (newQuantity <= 0) {
        const updatedHoldings = { ...state.holdings };
        delete updatedHoldings[assetId];

        return {
          ...state,
          holdings: updatedHoldings,
        };
      }

      return {
        ...state,
        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: newQuantity,
          },
        },
      };
    }
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [...state.transactions, action.transaction],
      };
    default:
      return state;
  }
}