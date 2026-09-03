import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import usePriceFeed from "../hooks/usePriceFeed";
import { useNotifications } from "./NotificationContext";

const PriceAlertContext = createContext(null);

const STORAGE_KEY = "trading-simulator-price-alerts";

let alertId = 0;

function createAlertId() {
  alertId += 1;

  return `alert-${Date.now()}-${alertId}`;
}

function getInitialAlerts() {
  try {
    const storedAlerts =
      localStorage.getItem(STORAGE_KEY);

    if (!storedAlerts) {
      return [];
    }

    const parsedAlerts = JSON.parse(storedAlerts);

    if (!Array.isArray(parsedAlerts)) {
      return [];
    }

    return parsedAlerts.filter((alert) => {
      return (
        alert &&
        typeof alert.id === "string" &&
        typeof alert.assetId === "string" &&
        typeof alert.assetSymbol === "string" &&
        Number.isFinite(alert.threshold) &&
        alert.threshold > 0 &&
        ["above", "below"].includes(
          alert.direction,
        )
      );
    });
  } catch {
    return [];
  }
}

export function PriceAlertProvider({ children }) {
  const { prices } = usePriceFeed();
  const { info } = useNotifications();

  const [alerts, setAlerts] = useState(
    getInitialAlerts,
  );

  const previousPricesRef = useRef({});

  /*
   * Persist alerts whenever the alert list changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(alerts),
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [alerts]);

  /*
   * Add a new alert.
   *
   * Multiple alerts are allowed for the same asset,
   * as long as the exact same threshold + direction
   * combination does not already exist.
   */
  const addAlert = useCallback(
    ({
      assetId,
      assetSymbol,
      threshold,
      direction,
    }) => {
      const numericThreshold = Number(threshold);

      if (
        !assetId ||
        !assetSymbol ||
        !Number.isFinite(numericThreshold) ||
        numericThreshold <= 0 ||
        !["above", "below"].includes(direction)
      ) {
        return null;
      }

      let createdAlertId = null;

      setAlerts((currentAlerts) => {
        const existingAlert =
          currentAlerts.find(
            (alert) =>
              alert.assetId === assetId &&
              alert.threshold ===
                numericThreshold &&
              alert.direction === direction,
          );

        if (existingAlert) {
          createdAlertId = existingAlert.id;

          return currentAlerts;
        }

        const id = createAlertId();

        createdAlertId = id;

        const newAlert = {
          id,
          assetId,
          assetSymbol,
          threshold: numericThreshold,
          direction,
        };

        return [
          ...currentAlerts,
          newAlert,
        ];
      });

      return createdAlertId;
    },
    [],
  );

  /*
   * Remove one specific alert.
   */
  const removeAlert = useCallback((id) => {
    setAlerts((currentAlerts) =>
      currentAlerts.filter(
        (alert) => alert.id !== id,
      ),
    );
  }, []);

  /*
   * Remove every alert belonging to one asset.
   */
  const removeAlertsForAsset = useCallback(
    (assetId) => {
      setAlerts((currentAlerts) =>
        currentAlerts.filter(
          (alert) => alert.assetId !== assetId,
        ),
      );
    },
    [],
  );

  /*
   * Global price-alert monitoring.
   *
   * This runs inside PriceAlertProvider, NOT inside
   * Asset Detail, so alerts continue working when
   * the user navigates to another page.
   */
  useEffect(() => {
    Object.entries(prices).forEach(
      ([assetId, priceData]) => {
        const currentPrice =
          priceData?.current;

        if (
          typeof currentPrice !== "number" ||
          !Number.isFinite(currentPrice)
        ) {
          return;
        }

        const previousPrice =
          previousPricesRef.current[assetId];

        previousPricesRef.current[assetId] =
          currentPrice;

        /*
         * On the first price update there is no
         * previous price to compare against.
         */
        if (
          typeof previousPrice !== "number" ||
          !Number.isFinite(previousPrice)
        ) {
          return;
        }

        alerts.forEach((alert) => {
          if (alert.assetId !== assetId) {
            return;
          }

          const crossedAbove =
            previousPrice < alert.threshold &&
            currentPrice >= alert.threshold;

          const crossedBelow =
            previousPrice > alert.threshold &&
            currentPrice <= alert.threshold;

          if (
            alert.direction === "above" &&
            crossedAbove
          ) {
            info(
              `${alert.assetSymbol} crossed above $${alert.threshold.toFixed(
                2,
              )}. Current price: $${currentPrice.toFixed(
                2,
              )}.`,
            );
          }

          if (
            alert.direction === "below" &&
            crossedBelow
          ) {
            info(
              `${alert.assetSymbol} crossed below $${alert.threshold.toFixed(
                2,
              )}. Current price: $${currentPrice.toFixed(
                2,
              )}.`,
            );
          }
        });
      },
    );
  }, [prices, alerts, info]);

  return (
    <PriceAlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        removeAlertsForAsset,
      }}
    >
      {children}
    </PriceAlertContext.Provider>
  );
}

export function usePriceAlerts() {
  const context = useContext(
    PriceAlertContext,
  );

  if (!context) {
    throw new Error(
      "usePriceAlerts must be used inside PriceAlertProvider",
    );
  }

  return context;
}

export default PriceAlertContext;