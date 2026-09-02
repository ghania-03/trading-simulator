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

let alertId = 0;

function createAlertId() {
  alertId += 1;
  return `alert-${Date.now()}-${alertId}`;
}

export function PriceAlertProvider({ children }) {
  const { prices } = usePriceFeed();
  const { info } = useNotifications();

  const [alerts, setAlerts] = useState([]);

  const previousPricesRef = useRef({});

  const addAlert = useCallback(
    ({ assetId, threshold, direction, assetSymbol }) => {
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

      const existingAlert = alerts.find(
        (alert) =>
          alert.assetId === assetId &&
          alert.threshold === numericThreshold &&
          alert.direction === direction,
      );

      if (existingAlert) {
        return existingAlert.id;
      }

      const id = createAlertId();

      setAlerts((current) => [
        ...current,
        {
          id,
          assetId,
          assetSymbol,
          threshold: numericThreshold,
          direction,
        },
      ]);

      return id;
    },
    [alerts],
  );

  const removeAlert = useCallback((id) => {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id),
    );
  }, []);

  const removeAlertsForAsset = useCallback((assetId) => {
    setAlerts((current) =>
      current.filter(
        (alert) => alert.assetId !== assetId,
      ),
    );
  }, []);

  useEffect(() => {
    Object.entries(prices).forEach(
      ([assetId, priceData]) => {
        const currentPrice = priceData?.current;

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
  const context = useContext(PriceAlertContext);

  if (!context) {
    throw new Error(
      "usePriceAlerts must be used inside PriceAlertProvider",
    );
  }

  return context;
}

export default PriceAlertContext;