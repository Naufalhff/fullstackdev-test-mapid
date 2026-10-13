import type { Request, Response } from "express";
import * as userService from "./service.js";
import { signToken } from "../../middleware/auth.js";
import { sendCreated, sendError, sendSuccess } from "../../utils/response.js";

export async function login(request: Request, response: Response) {
  const submittedUsername = String(request.body?.username ?? "").trim();
  const submittedPassword = String(request.body?.password ?? "");
  if (!submittedUsername || !submittedPassword) {
    const validationErrors: Record<string, string> = {};
    if (!submittedUsername) validationErrors.username = "Username wajib diisi";
    if (!submittedPassword) validationErrors.password = "Password wajib diisi";
    sendError(response, 400, "Validasi gagal", validationErrors);
    return;
  }
  const existingUser = await userService.findUserByUsername(submittedUsername);
  if (
    !existingUser ||
    !(await userService.verifyPassword(
      existingUser.password_hash,
      submittedPassword,
    ))
  ) {
    sendError(response, 401, "Username atau password salah");
    return;
  }
  const authenticationToken = signToken({
    id: existingUser.id,
    role: existingUser.role as never,
  });
  sendSuccess(
    response,
    {
      token: authenticationToken,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
      },
    },
    "Login berhasil",
  );
}

export async function me(request: Request, response: Response) {
  const { getUser } = await import("../../middleware/auth.js");
  const authenticatedUser = getUser(request);
  sendSuccess(
    response,
    { id: authenticatedUser.id, role: authenticatedUser.role },
    "OK",
  );
}

export async function listUsers(_request: Request, response: Response) {
  const userRows = await userService.listUsers();
  sendSuccess(response, userRows, "Users retrieved");
}

export async function listPermissions(_request: Request, response: Response) {
  const { getPermissions } = await import("./permissions.js");
  const permissionRows = await getPermissions();
  sendSuccess(response, permissionRows, "Permissions retrieved");
}

export async function myPermissions(request: Request, response: Response) {
  const { getUser } = await import("../../middleware/auth.js");
  const { getPermissionsByRole } = await import("./permissions.js");
  const authenticatedUser = getUser(request);
  const permissionRows = await getPermissionsByRole(authenticatedUser.role);
  sendSuccess(response, permissionRows, "My permissions");
}

export async function updatePermission(request: Request, response: Response) {
  const { setPermission } = await import("./permissions.js");
  const targetRole = String(request.body?.role ?? "").trim();
  const targetFeature = String(request.body?.feature ?? "").trim();
  const isAllowed = Boolean(request.body?.allowed);
  if (
    !["admin", "pelapor", "approver"].includes(targetRole) ||
    !targetFeature
  ) {
    sendError(response, 400, "role/feature tidak valid");
    return;
  }
  const updatedPermission = await setPermission(
    targetRole,
    targetFeature,
    isAllowed,
  );
  sendSuccess(response, updatedPermission, "Permission updated");
}

export async function createUser(request: Request, response: Response) {
  const submittedUsername = String(request.body?.username ?? "").trim();
  const submittedPassword = String(request.body?.password ?? "");
  const submittedRole = String(request.body?.role ?? "").trim();
  const validationErrors: Record<string, string> = {};
  if (!submittedUsername) validationErrors.username = "Username wajib diisi";
  if (!submittedPassword || submittedPassword.length < 6)
    validationErrors.password = "Password minimal 6 karakter";
  if (!["admin", "pelapor", "approver"].includes(submittedRole))
    validationErrors.role = "Role harus admin, pelapor, atau approver";
  if (Object.keys(validationErrors).length) {
    sendError(response, 400, "Validasi gagal", validationErrors);
    return;
  }
  try {
    const createdUser = await userService.createUser(
      submittedUsername,
      submittedPassword,
      submittedRole,
    );
    sendCreated(response, createdUser, "User created");
  } catch (creationError: unknown) {
    const errorMessage =
      creationError instanceof Error ? creationError.message : "";
    if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
      sendError(response, 409, "Username sudah dipakai");
      return;
    }
    throw creationError;
  }
}

export async function patchUser(request: Request, response: Response) {
  const targetUserId = Number(request.params.id);
  if (!Number.isInteger(targetUserId)) {
    sendError(response, 400, "ID tidak valid");
    return;
  }
  const nextUsername =
    request.body?.username !== undefined
      ? String(request.body.username).trim()
      : undefined;
  const nextRole =
    request.body?.role !== undefined
      ? String(request.body.role).trim()
      : undefined;
  const nextPassword =
    request.body?.password !== undefined
      ? String(request.body.password)
      : undefined;
  const validationErrors: Record<string, string> = {};
  if (nextUsername !== undefined && !nextUsername)
    validationErrors.username = "Username wajib diisi";
  if (
    nextPassword !== undefined &&
    nextPassword.length > 0 &&
    nextPassword.length < 6
  )
    validationErrors.password = "Password minimal 6 karakter";
  if (
    nextRole !== undefined &&
    !["admin", "pelapor", "approver"].includes(nextRole)
  )
    validationErrors.role = "Role harus admin, pelapor, atau approver";
  if (Object.keys(validationErrors).length) {
    sendError(response, 400, "Validasi gagal", validationErrors);
    return;
  }
  if (
    nextUsername === undefined &&
    nextRole === undefined &&
    (nextPassword === undefined || !nextPassword)
  ) {
    sendError(response, 400, "Tidak ada perubahan");
    return;
  }
  const authenticatedUser = (await import("../../middleware/auth.js")).getUser(
    request,
  );
  if (
    authenticatedUser.id === targetUserId &&
    nextRole !== undefined &&
    nextRole !== authenticatedUser.role
  ) {
    sendError(response, 400, "Tidak bisa ubah role sendiri");
    return;
  }
  try {
    const updatedUser = await userService.updateUser(targetUserId, {
      username: nextUsername,
      role: nextRole,
      password: nextPassword || undefined,
    });
    if (!updatedUser) {
      sendError(response, 404, "User tidak ditemukan");
      return;
    }
    sendSuccess(response, updatedUser, "User updated");
  } catch (updateError: unknown) {
    const errorMessage =
      updateError instanceof Error ? updateError.message : "";
    if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
      sendError(response, 409, "Username sudah dipakai");
      return;
    }
    throw updateError;
  }
}

export async function removeUser(request: Request, response: Response) {
  const targetUserId = Number(request.params.id);
  if (!Number.isInteger(targetUserId)) {
    sendError(response, 400, "ID tidak valid");
    return;
  }
  const authenticatedUser = (await import("../../middleware/auth.js")).getUser(
    request,
  );
  if (authenticatedUser.id === targetUserId) {
    sendError(response, 400, "Tidak bisa hapus akun sendiri");
    return;
  }
  try {
    const deletedUser = await userService.deleteUser(targetUserId);
    if (!deletedUser) {
      sendError(response, 404, "User tidak ditemukan");
      return;
    }
    sendSuccess(response, deletedUser, "User deleted");
  } catch (deleteError: unknown) {
    const errorMessage =
      deleteError instanceof Error ? deleteError.message : "";
    if (
      errorMessage.includes("violates foreign key") ||
      errorMessage.includes("23503")
    ) {
      sendError(
        response,
        409,
        "User masih punya laporan/riwayat, tidak bisa dihapus",
      );
      return;
    }
    throw deleteError;
  }
}
