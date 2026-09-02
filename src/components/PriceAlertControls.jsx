import { useState } from "react";
import usePriceAlert from "../hooks/usePriceAlert";

function PriceAlertControls({ asset }) {
  const [alertThreshold, setAlertThreshold] = useState("");

  const [alertDirection, setAlertDirection] = useState("above");

  const { isActive, enableAlert, disableAlert } = usePriceAlert(
    asset.id,
    alertThreshold,
    alertDirection,
    asset.symbol,
  );

  function handleEnableAlert() {
    const threshold = Number(alertThreshold);

    if (!Number.isFinite(threshold) || threshold <= 0) {
      return;
    }

    enableAlert();
  }

  function handleDisableAlert() {
    disableAlert();
  }

  return (
    <section>
      <h2>Price Alert</h2>

      <label>
        Alert when price goes{" "}
        <select
          value={alertDirection}
          onChange={(event) => setAlertDirection(event.target.value)}
          disabled={isActive}
        >
          <option value="above">above</option>

          <option value="below">below</option>
        </select>
      </label>

      <br />

      <label>
        Threshold: $
        <input
          type="number"
          min="0"
          step="any"
          value={alertThreshold}
          onChange={(event) => setAlertThreshold(event.target.value)}
          placeholder="Enter price"
          disabled={isActive}
        />
      </label>

      <div>
        {!isActive ? (
          <button type="button" onClick={handleEnableAlert}>
            Set Alert
          </button>
        ) : (
          <button type="button" onClick={handleDisableAlert}>
            Remove Alert
          </button>
        )}
      </div>

      {isActive && (
        <p>
          Alert is active: notify when {asset.symbol} goes {alertDirection} $
          {Number(alertThreshold).toFixed(2)}.
        </p>
      )}
    </section>
  );
}

export default PriceAlertControls;