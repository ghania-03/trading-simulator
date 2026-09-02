import { useQuery } from "@tanstack/react-query";

import {
  getLeaderboardData,
} from "../services/leaderboardService";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboardData,
  });
}