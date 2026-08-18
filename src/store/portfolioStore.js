import { create } from "zustand";

const usePortfolioStore = create((set) => ({
  cash: 10000,
  holdings: {},
  transactions: [],
  error: null,

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

      const newQuantity = Math.max(0, existingHolding.quantity - quantity);
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
      if (quantity <= 0) {
        return { error: "Quantity must be greater than 0" };
      }

      if (price <= 0) {
        return { error: "Invalid price" };
      }

      const totalCost = quantity * price;

      if (totalCost > state.cash) {
        return { error: "Insufficient cash" };
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

        error: null,
      };
    }),

  sell: (assetId, quantity, price) =>
    set((state) => {
      if (quantity <= 0) {
        return { error: "Quantity must be greater than 0" };
      }

      if (price <= 0) {
        return { error: "Invalid price" };
      }

      const existingHolding = state.holdings[assetId];

      if (!existingHolding) {
        return { error: "Insufficient holdings" };
      }

      if (quantity > existingHolding.quantity) {
        return { error: "Insufficient holdings" };
      }

      const totalValue = quantity * price;

      const newQuantity = Math.max(0, existingHolding.quantity - quantity);

      const updatedHoldings = { ...state.holdings };

      if (newQuantity === 0) {
        delete updatedHoldings[assetId];
      } else {
        updatedHoldings[assetId] = {
          quantity: newQuantity,
        };
      }

      return {
        cash: state.cash + totalValue,

        holdings: updatedHoldings,

        transactions: [
          ...state.transactions,
          {
            id: Date.now(),
            type: "SELL",
            assetId,
            quantity,
            price,
            total: totalValue,
            timestamp: new Date().toISOString(),
          },
        ],

        error: null,
      };
    }),
}));

export default usePortfolioStore;
