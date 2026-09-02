import {
  useMemo,
} from "react";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";
import { useLeaderboard } from "../hooks/useLeaderboard";
import {
  calculateFinancialsFromTransactions,
} from "../utils/portfolioCalculations";

function Leaderboard() {
  const {
    user,
  } = useContext(AuthContext);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeaderboard();

  const leaderboard =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const {
        users,
        transactions,
      } = data;

      return users
        .map((currentUser) => {
          const userTransactions =
            transactions.filter(
              (transaction) =>
                transaction.userId ===
                currentUser.id,
            );

          const {
            realizedPnl,
          } =
            calculateFinancialsFromTransactions(
              userTransactions,
            );

          return {
            id: currentUser.id,
            name: currentUser.name,
            realizedPnl,
          };
        })
        .sort(
          (a, b) =>
            b.realizedPnl -
            a.realizedPnl,
        )
        .map(
          (
            currentUser,
            index,
          ) => ({
            ...currentUser,
            rank: index + 1,
          }),
        );
    }, [data]);

  if (isLoading) {
    return <p>Loading leaderboard...</p>;
  }

  if (isError) {
    return (
      <section>
        <h1>Leaderboard</h1>

        <p role="alert">
          Failed to load leaderboard.
        </p>

        <p>
          {error?.message ||
            "Something went wrong."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </section>
    );
  }

  const currentUserEntry =
    leaderboard.find(
      (entry) =>
        entry.id === user?.id,
    );

  return (
    <section>
      <h1>Leaderboard</h1>

      <p>
        Ranked by realized P&L
      </p>

      {currentUserEntry && (
        <div>
          <h2>Your Ranking</h2>

          <p>
            Rank: #
            {currentUserEntry.rank}
          </p>

          <p>
            Realized P&L: $
            {currentUserEntry.realizedPnl.toFixed(
              2,
            )}
          </p>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <p>
          No users available.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Trader</th>
              <th>Realized P&L</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map(
              (entry) => (
                <tr
                  key={entry.id}
                >
                  <td>
                    #{entry.rank}
                  </td>

                  <td>
                    {entry.name}

                    {entry.id ===
                      user?.id &&
                      " (You)"}
                  </td>

                  <td>
                    $
                    {entry.realizedPnl.toFixed(
                      2,
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Leaderboard;