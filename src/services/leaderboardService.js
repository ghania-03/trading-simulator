const API_URL = import.meta.env.VITE_API_URL;

export async function getUsers() {
  const response = await fetch(
    `${API_URL}/users`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch users",
    );
  }

  return response.json();
}

export async function getLeaderboardData() {
  const [usersResponse, transactionsResponse] =
    await Promise.all([
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/transactions`),
    ]);

  if (
    !usersResponse.ok ||
    !transactionsResponse.ok
  ) {
    throw new Error(
      "Failed to fetch leaderboard data",
    );
  }

  const [users, transactions] =
    await Promise.all([
      usersResponse.json(),
      transactionsResponse.json(),
    ]);

  return {
    users,
    transactions,
  };
}