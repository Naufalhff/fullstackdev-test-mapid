import { requestJson } from "../lib/api";
import type { AuthUser, Role } from "../lib/api";
export type { AuthUser, Role } from "../lib/api";

export async function login(authenticationPayload: {
  username: string;
  password: string;
}) {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: { token: string; user: AuthUser };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(authenticationPayload),
  });
  return responseBody.data;
}

export async function fetchUsers() {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: AuthUser[];
  }>("/auth/users");
  return responseBody.data;
}

export async function createUser(createPayload: {
  username: string;
  password: string;
  role: Role;
}) {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: AuthUser;
  }>("/auth/users", { method: "POST", body: JSON.stringify(createPayload) });
  return responseBody.data;
}

export async function updateUser(
  targetUserId: number,
  updatePayload: { username?: string; role?: Role; password?: string },
) {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: AuthUser;
  }>(`/auth/users/${targetUserId}`, {
    method: "PATCH",
    body: JSON.stringify(updatePayload),
  });
  return responseBody.data;
}

export async function deleteUser(targetUserId: number) {
  await requestJson<{ status: string; message: string; data: unknown }>(
    `/auth/users/${targetUserId}`,
    { method: "DELETE" },
  );
}

export async function fetchMyPermissions() {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: Array<{ feature: string; allowed: boolean }>;
  }>("/auth/my-permissions");
  return responseBody.data;
}

export async function fetchAllPermissions() {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: Array<{ role: string; feature: string; allowed: boolean }>;
  }>("/auth/permissions");
  return responseBody.data;
}

export async function updatePermission(
  targetRole: string,
  targetFeature: string,
  isAllowed: boolean,
) {
  const responseBody = await requestJson<{
    status: string;
    message: string;
    data: { role: string; feature: string; allowed: boolean };
  }>("/auth/permissions", {
    method: "PATCH",
    body: JSON.stringify({
      role: targetRole,
      feature: targetFeature,
      allowed: isAllowed,
    }),
  });
  return responseBody.data;
}
