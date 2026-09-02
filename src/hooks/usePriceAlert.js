import { useCallback, useMemo } from "react";
import { usePriceAlerts } from "../context/PriceAlertContext";

function usePriceAlert(assetId, assetSymbol) {
  const {
    alerts,
    addAlert,
    removeAlert,
  } = usePriceAlerts();

  const assetAlerts = useMemo(() => {
    return alerts.filter(
      (alert) => alert.assetId === assetId,
    );
  }, [alerts, assetId]);

  const enableAlert = useCallback(
    ({ threshold, direction }) => {
      return addAlert({
        assetId,
        assetSymbol,
        threshold,
        direction,
      });
    },
    [
      addAlert,
      assetId,
      assetSymbol,
    ],
  );

  const disableAlert = useCallback(
    (alertId) => {
      removeAlert(alertId);
    },
    [removeAlert],
  );

  return {
    alerts: assetAlerts,
    enableAlert,
    disableAlert,
  };
}

export default usePriceAlert;