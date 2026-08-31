import { useQuery } from "@tanstack/react-query";
import {
  getAssets,
  getAssetById,
} from "../services/assetService";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });
}

export function useAsset(assetId) {
  return useQuery({
    queryKey: ["assets", assetId],
    queryFn: () =>
      getAssetById(assetId),
    enabled: Boolean(assetId),
  });
}