import { useMemo, useState } from "react";
import { assets } from "../data/assets";
import usePriceFeed from "../hooks/usePriceFeed";
import AssetCard from "../components/AssetCard";
import { getPriceChange } from "../utils/priceChange";

function Market() {
  const { prices } = usePriceFeed();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState("default");

  const visibleAssets = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    const filteredAssets = assets.filter(
      (asset) => {
        if (!searchTerm) {
          return true;
        }

        return (
          asset.symbol
            .toLowerCase()
            .includes(searchTerm) ||
          asset.name
            .toLowerCase()
            .includes(searchTerm)
        );
      },
    );

    if (sortBy === "default") {
      return filteredAssets;
    }

    return [...filteredAssets].sort(
      (a, b) => {
        const priceA = prices[a.id];
        const priceB = prices[b.id];

        if (!priceA || !priceB) {
          return 0;
        }

        if (sortBy === "name-asc") {
          return a.name.localeCompare(
            b.name,
          );
        }

        if (sortBy === "price-high") {
          return (
            priceB.current -
            priceA.current
          );
        }

        if (sortBy === "price-low") {
          return (
            priceA.current -
            priceB.current
          );
        }

        const changeA = getPriceChange(
          priceA.current,
          priceA.previous,
        );

        const changeB = getPriceChange(
          priceB.current,
          priceB.previous,
        );

        if (sortBy === "change-high") {
          return (
            changeB.percentage -
            changeA.percentage
          );
        }

        if (sortBy === "change-low") {
          return (
            changeA.percentage -
            changeB.percentage
          );
        }

        return 0;
      },
    );
  }, [search, sortBy, prices]);

  return (
    <div>
      <h1>Market</h1>

      <section>
        <label>
          Search assets:

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name or symbol"
          />
        </label>

        <label>
          Sort by:

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="default">
              Default
            </option>

            <option value="name-asc">
              Name: A-Z
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="change-high">
              Change: Highest
            </option>

            <option value="change-low">
              Change: Lowest
            </option>
          </select>
        </label>
      </section>

      <p>
        Showing {visibleAssets.length} of{" "}
        {assets.length} assets
      </p>

      {visibleAssets.length === 0 ? (
        <p>
          No assets match your search.
        </p>
      ) : (
        visibleAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            priceData={prices[asset.id]}
          />
        ))
      )}
    </div>
  );
}

export default Market;