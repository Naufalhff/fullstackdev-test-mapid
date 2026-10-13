import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReport,
  fetchStats,
  listReports,
  patchStatus,
  updateReport,
} from "../services/reports";
import type { ReportStatus } from "../lib/api";

export function useReports(currentPage = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["reports", currentPage, pageSize],
    queryFn: () => listReports(currentPage, pageSize),
  });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: fetchStats });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { nama: string; deskripsi: string }) =>
      createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; nama: string; deskripsi: string }) =>
      updateReport(payload.id, {
        nama: payload.nama,
        deskripsi: payload.deskripsi,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; status: ReportStatus }) =>
      patchStatus(payload.id, payload.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
