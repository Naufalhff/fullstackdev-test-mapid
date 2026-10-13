import type { Response } from "express";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ApiSuccessResponse<T> = {
  status: "success";
  message: string;
  data: T;
  pagination?: PaginationMeta;
};

export type ApiErrorResponse = {
  status: "error";
  message: string;
  errors?: Record<string, string>;
};

export function sendSuccess<T>(
  response: Response,
  data: T,
  successMessage: string,
  paginationMeta?: PaginationMeta,
) {
  const responseBody: ApiSuccessResponse<T> = {
    status: "success",
    message: successMessage,
    data,
    ...(paginationMeta ? { pagination: paginationMeta } : {}),
  };
  response.json(responseBody);
}

export function sendCreated<T>(
  response: Response,
  data: T,
  successMessage: string,
) {
  response
    .status(201)
    .json({
      status: "success",
      message: successMessage,
      data,
    } as ApiSuccessResponse<T>);
}

export function sendError(
  response: Response,
  statusCode: number,
  errorMessage: string,
  validationErrors?: Record<string, string>,
) {
  const responseBody: ApiErrorResponse = {
    status: "error",
    message: errorMessage,
    ...(validationErrors ? { errors: validationErrors } : {}),
  };
  response.status(statusCode).json(responseBody);
}

export function parsePagination(queryParameters: Record<string, unknown>) {
  const requestedPage = Math.min(
    Math.max(parseInt(String(queryParameters.page ?? "1"), 10) || 1, 1),
    1000,
  );
  const requestedLimit = Math.min(
    Math.max(parseInt(String(queryParameters.limit ?? "10"), 10) || 10, 1),
    100,
  );
  return { requestedPage, requestedLimit };
}

export function buildPaginationMeta(
  totalRecordCount: number,
  currentPage: number,
  pageSize: number,
): PaginationMeta {
  return {
    total: totalRecordCount,
    page: currentPage,
    limit: pageSize,
    pages: Math.ceil(totalRecordCount / pageSize),
  };
}
