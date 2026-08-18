import { create } from "zustand";

const usePortfolioStore = create((set) => ({
  cash: 10000,
  holdings: {},
  transactions: [],

  deposit: (amount) =>
    set((state) => ({
      cash: state.cash + amount,
    })),

  withdraw: (amount) =>
    set((state) => ({
      cash: state.cash - amount,
    })),

  addHolding: (assetId, quantity) =>
    set((state) => {
      const existingHolding = state.holdings[assetId];

      return {
        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: (existingHolding?.quantity || 0) + quantity,
          },
        },
      };
    }),

  removeHolding: (assetId, quantity) =>
    set((state) => {
      const existingHolding = state.holdings[assetId];

      if (!existingHolding) {
        return {};
      }

      const newQuantity = existingHolding.quantity - quantity;

      if (newQuantity <= 0) {
        const updatedHoldings = { ...state.holdings };

        delete updatedHoldings[assetId];

        return {
          holdings: updatedHoldings,
        };
      }

      return {
        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: newQuantity,
          },
        },
      };
    }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),

  buy: (assetId, quantity, price) =>
    set((state) => {
      const totalCost = quantity * price;

      if (quantity <= 0) {
        return state;
      }

      if (totalCost > state.cash) {
        return state;
      }

      const existingHolding = state.holdings[assetId];

      return {
        cash: state.cash - totalCost,

        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: (existingHolding?.quantity || 0) + quantity,
          },
        },

        transactions: [
          ...state.transactions,
          {
            id: Date.now(),
            type: "BUY",
            assetId,
            quantity,
            price,
            total: totalCost,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }),
    
}));

export default usePortfolioStore;
