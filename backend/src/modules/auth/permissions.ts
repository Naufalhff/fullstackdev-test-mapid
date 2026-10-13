import { pool } from "../../db.js";

type PermissionRow = { role: string; feature: string; allowed: boolean };
type AllowedRow = { allowed: boolean };
type FeatureAllowedRow = { feature: string; allowed: boolean };

export async function getPermissions(): Promise<PermissionRow[]> {
  const queryResult = await pool.query<PermissionRow>(
    "SELECT role, feature, allowed FROM permissions ORDER BY role, feature",
  );
  return queryResult.rows;
}

export async function setPermission(
  targetRole: string,
  targetFeature: string,
  isAllowed: boolean,
): Promise<PermissionRow> {
  const queryResult = await pool.query<PermissionRow>(
    "INSERT INTO permissions (role, feature, allowed) VALUES ($1,$2,$3) ON CONFLICT (role, feature) DO UPDATE SET allowed=$3 RETURNING role, feature, allowed",
    [targetRole, targetFeature, isAllowed],
  );
  return queryResult.rows[0];
}

export async function hasPermission(
  targetRole: string,
  targetFeature: string,
): Promise<boolean> {
  const queryResult = await pool.query<AllowedRow>(
    "SELECT allowed FROM permissions WHERE role=$1 AND feature=$2",
    [targetRole, targetFeature],
  );
  if (!queryResult.rows[0]) return false;
  return queryResult.rows[0].allowed;
}

export async function getPermissionsByRole(
  targetRole: string,
): Promise<FeatureAllowedRow[]> {
  const queryResult = await pool.query<FeatureAllowedRow>(
    "SELECT feature, allowed FROM permissions WHERE role=$1 ORDER BY feature",
    [targetRole],
  );
  return queryResult.rows;
}
