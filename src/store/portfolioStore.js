import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  roundQuantity,
  calculateFinancialsFromTransactions,
} from "../utils/portfolioCalculations";

const STARTING_CASH = 10000;
const STORAGE_VERSION = 3;

const createTransactionId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const createEmptyPortfolio = () => ({
  cash: STARTING_CASH,
  holdings: {},
  transactions: [],
});

const normalizeTransactions = (transactions) => {
  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions.filter(
    (transaction) =>
      transaction &&
      (transaction.type === "BUY" ||
        transaction.type === "SELL") &&
      typeof transaction.assetId === "string" &&
      Number.isFinite(transaction.quantity) &&
      transaction.quantity > 0 &&
      Number.isFinite(transaction.price) &&
      transaction.price > 0,
  );
};

const reconstructHoldings = (transactions, fallbackHoldings = {}) => {
  const reconstructed =
    calculateFinancialsFromTransactions(
      transactions,
    );

  const holdings = {};

  const assetIds = new Set([
    ...Object.keys(fallbackHoldings),
    ...Object.keys(reconstructed.positions),
  ]);

  for (const assetId of assetIds) {
    const reconstructedPosition =
      reconstructed.positions[assetId];

    const persistedHolding =
      fallbackHoldings[assetId];

    if (reconstructedPosition) {
      if (reconstructedPosition.quantity > 0) {
        holdings[assetId] = {
          quantity:
            reconstructedPosition.quantity,
          averageBuyPrice:
            reconstructedPosition.averageBuyPrice,
        };
      }

      continue;
    }

    if (
      persistedHolding &&
      Number.isFinite(
        persistedHolding.quantity,
      ) &&
      persistedHolding.quantity > 0
    ) {
      holdings[assetId] = {
        quantity: roundQuantity(
          persistedHolding.quantity,
        ),
        averageBuyPrice:
          Number.isFinite(
            persistedHolding.averageBuyPrice,
          ) &&
          persistedHolding.averageBuyPrice > 0
            ? persistedHolding.averageBuyPrice
            : 0,
      };
    }
  }

  return holdings;
};

const normalizePortfolio = (portfolio) => {
  if (
    !portfolio ||
    typeof portfolio !== "object"
  ) {
    return createEmptyPortfolio();
  }

  const transactions =
    normalizeTransactions(
      portfolio.transactions,
    );

  return {
    cash:
      Number.isFinite(portfolio.cash) &&
      portfolio.cash >= 0
        ? portfolio.cash
        : STARTING_CASH,

    holdings: reconstructHoldings(
      transactions,
      portfolio.holdings,
    ),

    transactions,
  };
};

const usePortfolioStore = create(
  persist(
    (set) => ({
      activeUserId: null,

      userPortfolios: {},

      cash: STARTING_CASH,
      holdings: {},
      transactions: [],
      error: null,

      setActiveUser: (userId) => {
        set((state) => {
          if (!userId) {
            return {
              activeUserId: null,
              cash: STARTING_CASH,
              holdings: {},
              transactions: [],
              error: null,
            };
          }

          const currentPortfolio =
            normalizePortfolio({
              cash: state.cash,
              holdings: state.holdings,
              transactions:
                state.transactions,
            });

          const updatedPortfolios = {
            ...state.userPortfolios,
          };

          /*
            Save the current user's portfolio before
            switching to another user.
          */
          if (state.activeUserId) {
            updatedPortfolios[
              state.activeUserId
            ] = currentPortfolio;
          }

          const targetPortfolio =
            updatedPortfolios[userId] ||
            createEmptyPortfolio();

          updatedPortfolios[userId] =
            targetPortfolio;

          return {
            activeUserId: userId,
            userPortfolios:
              updatedPortfolios,
            cash: targetPortfolio.cash,
            holdings: targetPortfolio.holdings,
            transactions:
              targetPortfolio.transactions,
            error: null,
          };
        });
      },

      clearError: () =>
        set({
          error: null,
        }),

      rollbackTransaction: (transactionId) => {
        set((state) => {
          const transaction =
            state.transactions.find(
              (item) =>
                item.id === transactionId,
            );

          if (!transaction) {
            return {};
          }

          const remainingTransactions =
            state.transactions.filter(
              (item) =>
                item.id !== transactionId,
            );

          const reconstructed =
            calculateFinancialsFromTransactions(
              remainingTransactions,
            );

          const holdings = {};

          for (const [
            assetId,
            position,
          ] of Object.entries(
            reconstructed.positions,
          )) {
            if (position.quantity > 0) {
              holdings[assetId] = {
                quantity: position.quantity,
                averageBuyPrice:
                  position.averageBuyPrice,
              };
            }
          }

          const updatedCash =
            transaction.type === "BUY"
              ? state.cash +
                transaction.total
              : state.cash -
                transaction.total;

          const updatedPortfolio = {
            cash: updatedCash,
            holdings,
            transactions:
              remainingTransactions,
          };

          const userPortfolios = {
            ...state.userPortfolios,
          };

          if (state.activeUserId) {
            userPortfolios[
              state.activeUserId
            ] = updatedPortfolio;
          }

          return {
            cash: updatedCash,
            holdings,
            transactions:
              remainingTransactions,
            userPortfolios,
            error: null,
          };
        });
      },

      buy: (
        assetId,
        quantity,
        price,
        userId,
      ) => {
        let result;

        set((state) => {
          if (
            !userId ||
            typeof userId !== "string"
          ) {
            result = {
              success: false,
              error:
                "Authenticated user is required",
            };

            return {
              error: result.error,
            };
          }

          if (
            state.activeUserId !== userId
          ) {
            result = {
              success: false,
              error:
                "Active user does not match authenticated user",
            };

            return {
              error: result.error,
            };
          }

          if (
            !assetId ||
            typeof assetId !== "string"
          ) {
            result = {
              success: false,
              error: "Invalid asset",
            };

            return {
              error: result.error,
            };
          }

          if (
            !Number.isFinite(quantity) ||
            quantity <= 0
          ) {
            result = {
              success: false,
              error:
                "Quantity must be greater than 0",
            };

            return {
              error: result.error,
            };
          }

          if (
            !Number.isFinite(price) ||
            price <= 0
          ) {
            result = {
              success: false,
              error: "Invalid price",
            };

            return {
              error: result.error,
            };
          }

          const totalCost =
            quantity * price;

          if (totalCost > state.cash) {
            result = {
              success: false,
              error: "Insufficient cash",
            };

            return {
              error: result.error,
            };
          }

          const existingHolding =
            state.holdings[assetId];

          const oldQuantity =
            existingHolding?.quantity || 0;

          const oldAverageBuyPrice =
            existingHolding?.averageBuyPrice ||
            0;

          const newQuantity = roundQuantity(
            oldQuantity + quantity,
          );

          const newAverageBuyPrice =
            oldQuantity === 0
              ? price
              : (oldQuantity *
                  oldAverageBuyPrice +
                  quantity * price) /
                newQuantity;

          const transaction = {
            id: createTransactionId(),
            userId,
            type: "BUY",
            assetId,
            quantity,
            price,
            total: totalCost,
            timestamp:
              new Date().toISOString(),
          };

          const updatedCash =
            state.cash - totalCost;

          const updatedHoldings = {
            ...state.holdings,
            [assetId]: {
              quantity: newQuantity,
              averageBuyPrice:
                newAverageBuyPrice,
            },
          };

          const updatedTransactions = [
            ...state.transactions,
            transaction,
          ];

          result = {
            success: true,
            transaction,
          };

          return {
            cash: updatedCash,

            holdings: updatedHoldings,

            transactions:
              updatedTransactions,

            userPortfolios: {
              ...state.userPortfolios,
              [userId]: {
                cash: updatedCash,
                holdings: updatedHoldings,
                transactions:
                  updatedTransactions,
              },
            },

            error: null,
          };
        });

        return result;
      },

      sell: (
        assetId,
        quantity,
        price,
        userId,
      ) => {
        let result;

        set((state) => {
          if (
            !userId ||
            typeof userId !== "string"
          ) {
            result = {
              success: false,
              error:
                "Authenticated user is required",
            };

            return {
              error: result.error,
            };
          }

          if (
            state.activeUserId !== userId
          ) {
            result = {
              success: false,
              error:
                "Active user does not match authenticated user",
            };

            return {
              error: result.error,
            };
          }

          if (
            !assetId ||
            typeof assetId !== "string"
          ) {
            result = {
              success: false,
              error: "Invalid asset",
            };

            return {
              error: result.error,
            };
          }

          if (
            !Number.isFinite(quantity) ||
            quantity <= 0
          ) {
            result = {
              success: false,
              error:
                "Quantity must be greater than 0",
            };

            return {
              error: result.error,
            };
          }

          if (
            !Number.isFinite(price) ||
            price <= 0
          ) {
            result = {
              success: false,
              error: "Invalid price",
            };

            return {
              error: result.error,
            };
          }

          const existingHolding =
            state.holdings[assetId];

          if (!existingHolding) {
            result = {
              success: false,
              error:
                "Insufficient holdings",
            };

            return {
              error: result.error,
            };
          }

          const availableQuantity =
            existingHolding.quantity;

          if (
            quantity > availableQuantity
          ) {
            result = {
              success: false,
              error:
                "Insufficient holdings",
            };

            return {
              error: result.error,
            };
          }

          const totalValue =
            quantity * price;

          const newQuantity = roundQuantity(
            availableQuantity - quantity,
          );

          const updatedHoldings = {
            ...state.holdings,
          };

          if (newQuantity === 0) {
            delete updatedHoldings[
              assetId
            ];
          } else {
            updatedHoldings[assetId] = {
              quantity: newQuantity,
              averageBuyPrice:
                existingHolding.averageBuyPrice,
            };
          }

          const transaction = {
            id: createTransactionId(),
            userId,
            type: "SELL",
            assetId,
            quantity,
            price,
            total: totalValue,
            timestamp:
              new Date().toISOString(),
          };

          const updatedCash =
            state.cash + totalValue;

          const updatedTransactions = [
            ...state.transactions,
            transaction,
          ];

          result = {
            success: true,
            transaction,
          };

          return {
            cash: updatedCash,

            holdings: updatedHoldings,

            transactions:
              updatedTransactions,

            userPortfolios: {
              ...state.userPortfolios,
              [userId]: {
                cash: updatedCash,
                holdings: updatedHoldings,
                transactions:
                  updatedTransactions,
              },
            },

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
        /*
          Existing version 2 data was not user-scoped.
          Preserve it as the initial portfolio. The first
          authenticated user will receive it when the
          application initializes their account.
        */
        if (
          !persistedState ||
          typeof persistedState !== "object"
        ) {
          return {
            activeUserId: null,
            userPortfolios: {},
            cash: STARTING_CASH,
            holdings: {},
            transactions: [],
            error: null,
          };
        }

        const legacyPortfolio =
          normalizePortfolio({
            cash: persistedState.cash,
            holdings:
              persistedState.holdings,
            transactions:
              persistedState.transactions,
          });

        return {
          activeUserId: null,
          userPortfolios: {},
          cash: legacyPortfolio.cash,
          holdings: legacyPortfolio.holdings,
          transactions:
            legacyPortfolio.transactions,
          error: null,
          legacyPortfolio,
        };
      },

      partialize: (state) => ({
        activeUserId:
          state.activeUserId,

        userPortfolios:
          state.userPortfolios,

        cash: state.cash,
        holdings: state.holdings,
        transactions:
          state.transactions,

        legacyPortfolio:
          state.legacyPortfolio,
      }),
    },
  ),
);

export default usePortfolioStore;