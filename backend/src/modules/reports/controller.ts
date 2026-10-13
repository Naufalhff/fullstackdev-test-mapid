import type { Request, Response } from "express";
import * as reportService from "./service.js";
import { getUser } from "../../middleware/auth.js";
import {
  buildPaginationMeta,
  parsePagination,
  sendCreated,
  sendError,
  sendSuccess,
} from "../../utils/response.js";

const allowedStatusTransitions = new Set(["approved", "rejected"]);

export async function list(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const { requestedPage, requestedLimit } = parsePagination(
    request.query as Record<string, unknown>,
  );
  const { reportRows, totalReportCount } = await reportService.listReports(
    requestedPage,
    requestedLimit,
    authenticatedUser,
  );
  sendSuccess(
    response,
    reportRows,
    "Reports retrieved",
    buildPaginationMeta(totalReportCount, requestedPage, requestedLimit),
  );
}

export async function stats(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const statisticsData =
    await reportService.getReportStatistics(authenticatedUser);
  sendSuccess(response, statisticsData, "Stats retrieved");
}

export async function create(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const reportName = String(request.body?.nama ?? "").trim();
  const reportDescription = String(request.body?.deskripsi ?? "").trim();
  const validationErrors: Record<string, string> = {};
  if (!reportName) validationErrors.nama = "Nama wajib diisi";
  if (!reportDescription) validationErrors.deskripsi = "Deskripsi wajib diisi";
  if (Object.keys(validationErrors).length) {
    sendError(response, 400, "Validasi gagal", validationErrors);
    return;
  }
  const createdReport = await reportService.createReport(
    reportName,
    reportDescription,
    authenticatedUser.id,
  );
  sendCreated(response, createdReport, "Report created");
}

export async function updateReport(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const targetReportId = Number(request.params.id);
  if (!Number.isInteger(targetReportId)) {
    sendError(response, 400, "id tidak valid");
    return;
  }
  const existingReport = await reportService.findReportById(targetReportId);
  if (!existingReport) {
    sendError(response, 404, "laporan tidak ditemukan");
    return;
  }
  if (existingReport.user_id !== authenticatedUser.id) {
    sendError(response, 403, "Hanya pemilik yang boleh edit");
    return;
  }
  if (existingReport.status !== "pending") {
    sendError(response, 400, "Hanya laporan pending yang bisa diedit");
    return;
  }
  const reportName = String(request.body?.nama ?? "").trim();
  const reportDescription = String(request.body?.deskripsi ?? "").trim();
  const validationErrors: Record<string, string> = {};
  if (!reportName) validationErrors.nama = "Nama wajib diisi";
  if (!reportDescription) validationErrors.deskripsi = "Deskripsi wajib diisi";
  if (Object.keys(validationErrors).length) {
    sendError(response, 400, "Validasi gagal", validationErrors);
    return;
  }
  const updatedReport = await reportService.updateReport(
    targetReportId,
    reportName,
    reportDescription,
  );
  sendSuccess(response, updatedReport, "Report updated");
}

export async function patchStatus(request: Request, response: Response) {
  const authenticatedUser = getUser(request);
  const targetReportId = Number(request.params.id);
  if (!Number.isInteger(targetReportId)) {
    sendError(response, 400, "id tidak valid");
    return;
  }
  const nextStatus = String(request.body?.status ?? "");
  if (!allowedStatusTransitions.has(nextStatus)) {
    sendError(response, 400, "status harus approved atau rejected");
    return;
  }
  const existingReport = await reportService.findReportById(targetReportId);
  if (!existingReport) {
    sendError(response, 404, "laporan tidak ditemukan");
    return;
  }
  const updatedReport = await reportService.updateReportStatus(
    targetReportId,
    nextStatus,
    authenticatedUser.id,
  );
  sendSuccess(response, updatedReport, "Report updated");
}
