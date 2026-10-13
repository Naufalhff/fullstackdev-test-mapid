export type Role = "admin" | "pelapor" | "approver";
export type ReportStatus = "pending" | "approved" | "rejected";
export type AuthUser = { id: number; username: string; role: Role };
export type Report = {
  id: number;
  nama: string;
  deskripsi: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
  decided_by: number | null;
  decided_at: string | null;
  decided_by_username: string | null;
};
export type HistoryRow = {
  id: number;
  report_id: number;
  report_nama: string;
  old_status: string;
  new_status: string;
  decided_by_username: string;
  decided_at: string;
};

export const apiBaseUrl = (
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL ?? ""
).replace(/\/$/, "");

export function getAuthenticationToken() {
  return localStorage.getItem("token") ?? "";
}

export type ApiError = Error & {
  errors?: Record<string, string>;
  statusCode?: number;
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function decodeTokenExpiry(authenticationToken: string): number | null {
  try {
    const payloadSegment = authenticationToken.split(".")[1];
    if (!payloadSegment) return null;
    const decodedPayload = JSON.parse(
      atob(payloadSegment.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decodedPayload.exp === "number"
      ? decodedPayload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(authenticationToken: string): boolean {
  const expiryTimestamp = decodeTokenExpiry(authenticationToken);
  if (expiryTimestamp === null) return false;
  return Date.now() >= expiryTimestamp;
}

export async function requestJson<T>(
  requestPath: string,
  requestInit?: RequestInit,
): Promise<T> {
  const authenticationToken = getAuthenticationToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(authenticationToken
      ? { Authorization: `Bearer ${authenticationToken}` }
      : {}),
    ...((requestInit?.headers as Record<string, string>) ?? {}),
  };
  const httpResponse = await fetch(`${apiBaseUrl}${requestPath}`, {
    ...requestInit,
    headers,
  });
  if (!httpResponse.ok) {
    const responseBody = (await httpResponse.json().catch(() => ({}))) as {
      message?: string;
      errors?: Record<string, string>;
    };
    const requestError = new Error(
      responseBody.message ?? `request failed ${httpResponse.status}`,
    ) as ApiError;
    requestError.errors = responseBody.errors;
    requestError.statusCode = httpResponse.status;
    const isLoginRequest = requestPath.includes("/auth/login");
    if (httpResponse.status === 401 && !isLoginRequest) {
      unauthorizedHandler?.();
    }
    throw requestError;
  }
  return httpResponse.json() as Promise<T>;
}

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};
export type ApiSuccessResponse<T> = {
  status: string;
  message: string;
  data: T;
  pagination?: PaginationMeta;
};
