const API_URL = "http://localhost:3001";

export async function getAssets() {
  const response = await fetch(
    `${API_URL}/assets`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch assets",
    );
  }

  return response.json();
}

export async function getAssetById(
  assetId,
) {
  const response = await fetch(
    `${API_URL}/assets/${assetId}`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch asset",
    );
  }

  return response.json();
}