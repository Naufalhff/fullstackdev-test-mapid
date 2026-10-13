import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../lib/api";
import type { ApiSuccessResponse, HistoryRow } from "../lib/api";

export function useHistory(currentPage = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["history", currentPage, pageSize],
    queryFn: () =>
      requestJson<ApiSuccessResponse<HistoryRow[]>>(
        `/history?page=${currentPage}&limit=${pageSize}`,
      ),
  });
}
