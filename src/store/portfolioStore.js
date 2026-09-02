import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  roundQuantity,
  calculateFinancialsFromTransactions,
} from "../utils/portfolioCalculations";

const STARTING_CASH = 10000;
const STORAGE_VERSION = 2;

const createTransactionId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const normalizeTransactions = (transactions) => {
  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions.filter(
    (transaction) =>
      transaction &&
      (transaction.type === "BUY" || transaction.type === "SELL") &&
      typeof transaction.assetId === "string" &&
      Number.isFinite(transaction.quantity) &&
      transaction.quantity > 0 &&
      Number.isFinite(transaction.price) &&
      transaction.price > 0,
  );
};

const migratePortfolio = (persistedState) => {
  if (!persistedState || typeof persistedState !== "object") {
    return {
      cash: STARTING_CASH,
      holdings: {},
      transactions: [],
      error: null,
    };
  }

  const transactions = normalizeTransactions(persistedState.transactions);

  const reconstructed = calculateFinancialsFromTransactions(transactions);

  const persistedHoldings =
    persistedState.holdings && typeof persistedState.holdings === "object"
      ? persistedState.holdings
      : {};

  const holdings = {};

  /*
    Transactions are the preferred source for rebuilding
    averageBuyPrice.

    We also preserve existing persisted holdings in case
    older state contains a position that cannot be
    reconstructed from transactions.
  */
  const assetIds = new Set([
    ...Object.keys(persistedHoldings),
    ...Object.keys(reconstructed.positions),
  ]);

  for (const assetId of assetIds) {
    const reconstructedPosition = reconstructed.positions[assetId];

    const persistedHolding = persistedHoldings[assetId];

    if (reconstructedPosition) {
      if (reconstructedPosition.quantity > 0) {
        holdings[assetId] = {
          quantity: reconstructedPosition.quantity,
          averageBuyPrice: reconstructedPosition.averageBuyPrice,
        };
      }

      continue;
    }

    if (
      persistedHolding &&
      Number.isFinite(persistedHolding.quantity) &&
      persistedHolding.quantity > 0
    ) {
      holdings[assetId] = {
        quantity: roundQuantity(persistedHolding.quantity),
        averageBuyPrice:
          Number.isFinite(persistedHolding.averageBuyPrice) &&
          persistedHolding.averageBuyPrice > 0
            ? persistedHolding.averageBuyPrice
            : 0,
      };
    }
  }

  return {
    cash:
      Number.isFinite(persistedState.cash) && persistedState.cash >= 0
        ? persistedState.cash
        : STARTING_CASH,

    holdings,

    transactions,

    error: null,
  };
};

const usePortfolioStore = create(
  persist(
    (set) => ({
      cash: STARTING_CASH,
      holdings: {},
      transactions: [],
      error: null,

      clearError: () =>
        set({
          error: null,
        }),
      rollbackTransaction: (transactionId) => {
        set((state) => {
          const transaction = state.transactions.find(
            (item) => item.id === transactionId,
          );

          if (!transaction) {
            return {};
          }

          const remainingTransactions = state.transactions.filter(
            (item) => item.id !== transactionId,
          );

          const reconstructed = calculateFinancialsFromTransactions(
            remainingTransactions,
          );

          const holdings = {};

          for (const [assetId, position] of Object.entries(
            reconstructed.positions,
          )) {
            if (position.quantity > 0) {
              holdings[assetId] = {
                quantity: position.quantity,
                averageBuyPrice: position.averageBuyPrice,
              };
            }
          }

          const updatedCash =
            transaction.type === "BUY"
              ? state.cash + transaction.total
              : state.cash - transaction.total;

          return {
            cash: updatedCash,
            holdings,
            transactions: remainingTransactions,
            error: null,
          };
        });
      },
      buy: (assetId, quantity, price) => {
        let result;

        set((state) => {
          if (!assetId || typeof assetId !== "string") {
            result = {
              success: false,
              error: "Invalid asset",
            };

            return {
              error: result.error,
            };
          }

          if (!Number.isFinite(quantity) || quantity <= 0) {
            result = {
              success: false,
              error: "Quantity must be greater than 0",
            };

            return {
              error: result.error,
            };
          }

          if (!Number.isFinite(price) || price <= 0) {
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

          const oldQuantity = existingHolding?.quantity || 0;

          const oldAverageBuyPrice = existingHolding?.averageBuyPrice || 0;

          const newQuantity = roundQuantity(oldQuantity + quantity);

          const newAverageBuyPrice =
            oldQuantity === 0
              ? price
              : (oldQuantity * oldAverageBuyPrice + quantity * price) /
                newQuantity;

          const transaction = {
            id: createTransactionId(),
            type: "BUY",
            assetId,
            quantity,
            price,
            total: totalCost,
            timestamp: new Date().toISOString(),
          };

          result = {
            success: true,
            transaction,
          };

          return {
            cash: state.cash - totalCost,

            holdings: {
              ...state.holdings,

              [assetId]: {
                quantity: newQuantity,
                averageBuyPrice: newAverageBuyPrice,
              },
            },

            transactions: [...state.transactions, transaction],

            error: null,
          };
        });

        return result;
      },

      sell: (assetId, quantity, price) => {
        let result;

        set((state) => {
          if (!assetId || typeof assetId !== "string") {
            result = {
              success: false,
              error: "Invalid asset",
            };

            return {
              error: result.error,
            };
          }

          if (!Number.isFinite(quantity) || quantity <= 0) {
            result = {
              success: false,
              error: "Quantity must be greater than 0",
            };

            return {
              error: result.error,
            };
          }

          if (!Number.isFinite(price) || price <= 0) {
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

          const availableQuantity = existingHolding.quantity;

          if (quantity > availableQuantity) {
            result = {
              success: false,
              error: "Insufficient holdings",
            };

            return {
              error: result.error,
            };
          }

          const totalValue = quantity * price;

          const newQuantity = roundQuantity(availableQuantity - quantity);

          const updatedHoldings = {
            ...state.holdings,
          };

          if (newQuantity === 0) {
            delete updatedHoldings[assetId];
          } else {
            updatedHoldings[assetId] = {
              quantity: newQuantity,
              averageBuyPrice: existingHolding.averageBuyPrice,
            };
          }

          const transaction = {
            id: createTransactionId(),
            type: "SELL",
            assetId,
            quantity,
            price,
            total: totalValue,
            timestamp: new Date().toISOString(),
          };

          result = {
            success: true,
            transaction,
          };

          return {
            cash: state.cash + totalValue,

            holdings: updatedHoldings,

            transactions: [...state.transactions, transaction],

            error: null,
          };
        });

        return result;
      },
    }),

    {
      name: "trading-simulator-portfolio",

      version: STORAGE_VERSION,

      migrate: (persistedState) => {
        return migratePortfolio(persistedState);
      },

      partialize: (state) => ({
        cash: state.cash,
        holdings: state.holdings,
        transactions: state.transactions,
      }),
    },
  ),
);

export default usePortfolioStore;
