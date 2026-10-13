import type { Report, ReportStatus } from "../lib/api";
import { requestJson } from "../lib/api";
export type { Report, ReportStatus } from "../lib/api";

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};
export type ListResponse = {
  status: string;
  message: string;
  data: Report[];
  pagination: Pagination;
};
export type SingleResponse = { status: string; message: string; data: Report };
export type StatsResponse = {
  status: string;
  message: string;
  data: { total: number; pending: number; approved: number; rejected: number };
};

export async function listReports(
  currentPage = 1,
  pageSize = 10,
): Promise<ListResponse> {
  return requestJson<ListResponse>(
    `/reports?page=${currentPage}&limit=${pageSize}`,
  );
}

export async function fetchStats(): Promise<StatsResponse> {
  return requestJson<StatsResponse>("/reports/stats");
}

export async function createReport(payload: {
  nama: string;
  deskripsi: string;
}): Promise<SingleResponse> {
  return requestJson<SingleResponse>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReport(
  reportId: number,
  payload: { nama: string; deskripsi: string },
): Promise<SingleResponse> {
  return requestJson<SingleResponse>(`/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function patchStatus(
  reportId: number,
  nextStatus: ReportStatus,
): Promise<SingleResponse> {
  return requestJson<SingleResponse>(`/reports/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: nextStatus }),
  });
}
