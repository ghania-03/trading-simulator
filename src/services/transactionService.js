const API_URL = import.meta.env.VITE_API_URL;

export async function createTransaction(
  transaction,
) {
  const existingResponse = await fetch(
    `${API_URL}/transactions/${transaction.id}`,
  );

  if (existingResponse.ok) {
    return existingResponse.json();
  }

  const response = await fetch(
    `${API_URL}/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to save transaction",
    );
  }

  return response.json();
}

export async function getTransactions() {
  const response = await fetch(
    `${API_URL}/transactions`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch transactions",
    );
  }

  return response.json();
}