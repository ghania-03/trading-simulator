import { createContext, useEffect, useState } from "react";
import { assets } from "../data/assets";
import { calculateNextPrice } from "../utils/price";

const PriceFeedContext = createContext(null);

const HISTORY_LIMIT = 100;

const createInitialPrices = () => {
  const timestamp = Date.now();

  return assets.reduce((result, asset) => {
    result[asset.id] = {
      current: asset.price,
      previous: asset.price,
      history: [
        {
          price: asset.price,
          timestamp,
        },
      ],
    };

    return result;
  }, {});
};

export function PriceFeedProvider({ children }) {
  const [prices, setPrices] = useState(
    createInitialPrices,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((currentPrices) => {
        return assets.reduce(
          (newPrices, asset) => {
            const currentPrice =
              currentPrices[asset.id].current;

            const nextPrice = calculateNextPrice(
              currentPrice,
              asset.volatility,
            );

            const currentHistory =
              currentPrices[asset.id].history;

            const nextHistory = [
              ...currentHistory,
              {
                price: nextPrice,
                timestamp: Date.now(),
              },
            ].slice(-HISTORY_LIMIT);

            newPrices[asset.id] = {
              current: nextPrice,
              previous: currentPrice,
              history: nextHistory,
            };

            return newPrices;
          },
          {},
        );
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