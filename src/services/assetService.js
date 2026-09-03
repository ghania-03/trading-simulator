const API_URL = import.meta.env.VITE_API_URL;

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