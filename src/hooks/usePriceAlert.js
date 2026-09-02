import { useCallback } from "react";
import { usePriceAlerts } from "../context/PriceAlertContext";

function usePriceAlert(
  assetId,
  threshold,
  direction,
  assetSymbol,
) {
  const {
    alerts,
    addAlert,
    removeAlert,
  } = usePriceAlerts();

  const numericThreshold = Number(threshold);

  const activeAlert = alerts.find(
    (alert) =>
      alert.assetId === assetId &&
      alert.threshold === numericThreshold &&
      alert.direction === direction,
  );

  const enableAlert = useCallback(() => {
    return addAlert({
      assetId,
      threshold: numericThreshold,
      direction,
      assetSymbol,
    });
  }, [
    addAlert,
    assetId,
    numericThreshold,
    direction,
    assetSymbol,
  ]);

  const disableAlert = useCallback(() => {
    if (activeAlert) {
      removeAlert(activeAlert.id);
    }
  }, [activeAlert, removeAlert]);

  return {
    isActive: Boolean(activeAlert),
    enableAlert,
    disableAlert,
  };
}

export default usePriceAlert;