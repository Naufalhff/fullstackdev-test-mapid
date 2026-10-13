import bcrypt from "bcryptjs";
import { pool } from "../../db.js";
import type { User } from "../../types.js";

type UserCredentialsRow = {
  id: number;
  username: string;
  password_hash: string;
  role: string;
};

export async function findUserByUsername(
  targetUsername: string,
): Promise<UserCredentialsRow | null> {
  const queryResult = await pool.query<UserCredentialsRow>(
    "SELECT id, username, password_hash, role FROM users WHERE username=$1",
    [targetUsername],
  );
  return queryResult.rows[0] ?? null;
}

export async function verifyPassword(
  passwordHash: string,
  plainPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function listUsers(): Promise<User[]> {
  const queryResult = await pool.query<User>(
    "SELECT id, username, role, created_at FROM users ORDER BY id ASC",
  );
  return queryResult.rows;
}

export async function createUser(
  targetUsername: string,
  plainPassword: string,
  targetRole: string,
): Promise<User> {
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const queryResult = await pool.query<User>(
    "INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3) RETURNING id, username, role, created_at",
    [targetUsername, passwordHash, targetRole],
  );
  return queryResult.rows[0];
}

export async function findUserById(targetUserId: number): Promise<User | null> {
  const queryResult = await pool.query<User>(
    "SELECT id, username, role, created_at FROM users WHERE id=$1",
    [targetUserId],
  );
  return queryResult.rows[0] ?? null;
}

export async function updateUser(
  targetUserId: number,
  updateFields: { username?: string; role?: string; password?: string },
): Promise<User | null> {
  const currentUserResult = await pool.query<{
    username: string;
    role: string;
  }>("SELECT username, role FROM users WHERE id=$1", [targetUserId]);
  if (!currentUserResult.rows[0]) return null;
  const nextUsername =
    updateFields.username ?? currentUserResult.rows[0].username;
  const nextRole = updateFields.role ?? currentUserResult.rows[0].role;
  if (updateFields.password) {
    const passwordHash = await bcrypt.hash(updateFields.password, 10);
    const updateResult = await pool.query<User>(
      "UPDATE users SET username=$2, role=$3, password_hash=$4 WHERE id=$1 RETURNING id, username, role, created_at",
      [targetUserId, nextUsername, nextRole, passwordHash],
    );
    return updateResult.rows[0];
  }
  const updateResult = await pool.query<User>(
    "UPDATE users SET username=$2, role=$3 WHERE id=$1 RETURNING id, username, role, created_at",
    [targetUserId, nextUsername, nextRole],
  );
  return updateResult.rows[0];
}

export async function deleteUser(
  targetUserId: number,
): Promise<{ id: number } | null> {
  const queryResult = await pool.query<{ id: number }>(
    "DELETE FROM users WHERE id=$1 RETURNING id",
    [targetUserId],
  );
  return queryResult.rows[0] ?? null;
}
