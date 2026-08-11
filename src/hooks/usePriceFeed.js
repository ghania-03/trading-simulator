import { useContext } from "react";
import PriceFeedContext from "../context/PriceFeedContext";

function usePriceFeed() {
  const context = useContext(PriceFeedContext);

  if (!context) {
    throw new Error(
      "usePriceFeed must be used inside PriceFeedProvider"
    );
  }

  return context;
}

export default usePriceFeed;