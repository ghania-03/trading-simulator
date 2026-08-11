import { createContext, useEffect, useState } from "react";
import { assets } from "../data/assets";
import { calculateNextPrice } from "../utils/price";

const PriceFeedContext = createContext(null);

export function PriceFeedProvider({ children }) {
  const initialPrices = assets.reduce((result, asset) => {
    result[asset.id] = {
      current: asset.price,
      previous: asset.price,
    };
    return result;
  }, {});

  const [prices, setPrices] = useState(initialPrices);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((currentPrices) => {
        return assets.reduce((newPrices, asset) => {
          const currentPrice = currentPrices[asset.id].current;
          const nextPrice = calculateNextPrice(currentPrice, asset.volatility);

          newPrices[asset.id] = {
            current: nextPrice,
            previous: currentPrice,
          }

          return newPrices;
        }, {});
      });
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <PriceFeedContext.Provider value={{ prices }}>
      {children}
    </PriceFeedContext.Provider>
  );
}

export default PriceFeedContext;
