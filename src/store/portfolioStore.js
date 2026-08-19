import { create } from "zustand";

const usePortfolioStore = create((set) => ({
  cash: 10000,
  holdings: {},
  transactions: [],
  error: null,

  clearError: () =>
    set({
      error: null,
    }),

  deposit: (amount) =>
    set((state) => ({
      cash: state.cash + amount,
    })),

  withdraw: (amount) =>
    set((state) => ({
      cash: state.cash - amount,
    })),

  buy: (assetId, quantity, price) => {
    let result;

    set((state) => {
      if (quantity <= 0) {
        result = {
          success: false,
          error: "Quantity must be greater than 0",
        };

        return {
          error: result.error,
        };
      }

      if (price <= 0) {
        result = {
          success: false,
          error: "Invalid price",
        };

        return {
          error: result.error,
        };
      }

      const totalCost = quantity * price;

      if (totalCost > state.cash) {
        result = {
          success: false,
          error: "Insufficient cash",
        };

        return {
          error: result.error,
        };
      }

      const existingHolding = state.holdings[assetId];

      const newQuantity =
        (existingHolding?.quantity || 0) + quantity;

      const transaction = {
        id: Date.now(),
        type: "BUY",
        assetId,
        quantity,
        price,
        total: totalCost,
        timestamp: new Date().toISOString(),
      };

      result = {
        success: true,
      };

      return {
        cash: state.cash - totalCost,

        holdings: {
          ...state.holdings,
          [assetId]: {
            quantity: newQuantity,
          },
        },

        transactions: [
          ...state.transactions,
          transaction,
        ],

        error: null,
      };
    });

    return result;
  },

  sell: (assetId, quantity, price) => {
    let result;

    set((state) => {
      if (quantity <= 0) {
        result = {
          success: false,
          error: "Quantity must be greater than 0",
        };

        return {
          error: result.error,
        };
      }

      if (price <= 0) {
        result = {
          success: false,
          error: "Invalid price",
        };

        return {
          error: result.error,
        };
      }

      const existingHolding = state.holdings[assetId];

      if (!existingHolding) {
        result = {
          success: false,
          error: "Insufficient holdings",
        };

        return {
          error: result.error,
        };
      }

      if (quantity > existingHolding.quantity) {
        result = {
          success: false,
          error: "Insufficient holdings",
        };

        return {
          error: result.error,
        };
      }

      const totalValue = quantity * price;

      const newQuantity =
        existingHolding.quantity - quantity;

      const updatedHoldings = {
        ...state.holdings,
      };

      if (newQuantity <= 0) {
        delete updatedHoldings[assetId];
      } else {
        updatedHoldings[assetId] = {
          quantity: newQuantity,
        };
      }

      const transaction = {
        id: Date.now(),
        type: "SELL",
        assetId,
        quantity,
        price,
        total: totalValue,
        timestamp: new Date().toISOString(),
      };

      result = {
        success: true,
      };

      return {
        cash: state.cash + totalValue,

        holdings: updatedHoldings,

        transactions: [
          ...state.transactions,
          transaction,
        ],

        error: null,
      };
    });

    return result;
  },
}));

export default usePortfolioStore;