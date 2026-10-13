import { pool } from "../../db.js";
import type { Report } from "../../types.js";

const baseReportSelectQuery = `SELECT r.id, r.nama, r.deskripsi, r.status, r.created_at, r.updated_at, r.user_id, r.decided_by, r.decided_at, u.username, du.username AS decided_by_username FROM reports r JOIN users u ON u.id = r.user_id LEFT JOIN users du ON du.id = r.decided_by`;

function buildPelaporReportScope(authenticatedUser: {
  id: number;
  role: string;
}) {
  const isPelaporRole = authenticatedUser.role === "pelapor";
  return {
    isPelaporRole,
    whereClause: isPelaporRole ? "WHERE r.user_id=$3" : "",
    countQueryParameters: isPelaporRole
      ? [authenticatedUser.id]
      : ([] as unknown[]),
    countQuerySql: isPelaporRole
      ? "SELECT COUNT(*)::text AS count FROM reports r WHERE r.user_id=$1"
      : "SELECT COUNT(*)::text AS count FROM reports r",
  };
}

function buildPelaporStatsScope(authenticatedUser: {
  id: number;
  role: string;
}) {
  const isPelaporRole = authenticatedUser.role === "pelapor";
  return {
    whereClause: isPelaporRole ? "WHERE user_id=$1" : "",
    queryParameters: isPelaporRole ? [authenticatedUser.id] : ([] as unknown[]),
  };
}

export async function listReports(
  currentPage: number,
  pageSize: number,
  authenticatedUser: { id: number; role: string },
): Promise<{ reportRows: Report[]; totalReportCount: number }> {
  const queryOffset = (currentPage - 1) * pageSize;
  const pelaporScope = buildPelaporReportScope(authenticatedUser);
  const listQueryParameters = pelaporScope.isPelaporRole
    ? [pageSize, queryOffset, authenticatedUser.id]
    : [pageSize, queryOffset];
  const [listQueryResult, countQueryResult] = await Promise.all([
    pool.query<Report>(
      `${baseReportSelectQuery} ${pelaporScope.whereClause} ORDER BY r.created_at DESC, r.id DESC LIMIT $1 OFFSET $2`,
      listQueryParameters as unknown[],
    ),
    pool.query<{ count: string }>(
      pelaporScope.countQuerySql,
      pelaporScope.countQueryParameters as unknown[],
    ),
  ]);
  return {
    reportRows: listQueryResult.rows,
    totalReportCount: Number(countQueryResult.rows[0].count),
  };
}

export async function getReportStatistics(authenticatedUser: {
  id: number;
  role: string;
}) {
  const statsScope = buildPelaporStatsScope(authenticatedUser);
  const [groupedCountResult, totalCountResult] = await Promise.all([
    pool.query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text AS count FROM reports ${statsScope.whereClause} GROUP BY status`,
      statsScope.queryParameters as unknown[],
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM reports ${statsScope.whereClause}`,
      statsScope.queryParameters as unknown[],
    ),
  ]);
  const countByStatusMap: Record<string, number> = {};
  for (const statusCountRow of groupedCountResult.rows)
    countByStatusMap[statusCountRow.status] = Number(statusCountRow.count);
  return {
    total: Number(totalCountResult.rows[0].count),
    pending: countByStatusMap.pending ?? 0,
    approved: countByStatusMap.approved ?? 0,
    rejected: countByStatusMap.rejected ?? 0,
  };
}

export async function createReport(
  reportName: string,
  reportDescription: string,
  ownerUserId: number,
): Promise<Report> {
  const insertResult = await pool.query<Report>(
    `INSERT INTO reports (nama, deskripsi, status, user_id) VALUES ($1,$2,'pending',$3) RETURNING id, nama, deskripsi, status, created_at, updated_at, user_id, decided_by, decided_at`,
    [reportName, reportDescription, ownerUserId],
  );
  const insertedReportRow = insertResult.rows[0];
  const ownerUserResult = await pool.query<{ username: string }>(
    "SELECT username FROM users WHERE id=$1",
    [ownerUserId],
  );
  return {
    ...insertedReportRow,
    username: ownerUserResult.rows[0].username,
    decided_by_username: null,
  };
}

export async function findReportById(
  targetReportId: number,
): Promise<Report | null> {
  const queryResult = await pool.query<Report>(
    `${baseReportSelectQuery} WHERE r.id=$1`,
    [targetReportId],
  );
  return queryResult.rows[0] ?? null;
}

export async function updateReport(
  targetReportId: number,
  reportName: string,
  reportDescription: string,
): Promise<Report | null> {
  const updateResult = await pool.query<Report>(
    `UPDATE reports SET nama=$2, deskripsi=$3, updated_at=now() WHERE id=$1 RETURNING id, nama, deskripsi, status, created_at, updated_at, user_id, decided_by, decided_at`,
    [targetReportId, reportName, reportDescription],
  );
  if (!updateResult.rows[0]) return null;
  return findReportById(targetReportId);
}

export async function updateReportStatus(
  targetReportId: number,
  nextStatus: string,
  decidedByUserId: number,
): Promise<Report | null> {
  const previousStatusResult = await pool.query<{ status: string }>(
    "SELECT status FROM reports WHERE id=$1",
    [targetReportId],
  );
  if (!previousStatusResult.rows[0]) return null;
  const databaseClient = await pool.connect();
  try {
    await databaseClient.query("BEGIN");
    await databaseClient.query(
      "UPDATE reports SET status=$2, decided_by=$3, decided_at=now(), updated_at=now() WHERE id=$1",
      [targetReportId, nextStatus, decidedByUserId],
    );
    await databaseClient.query(
      "INSERT INTO report_history (report_id, old_status, new_status, decided_by) VALUES ($1,$2,$3,$4)",
      [
        targetReportId,
        previousStatusResult.rows[0].status,
        nextStatus,
        decidedByUserId,
      ],
    );
    await databaseClient.query("COMMIT");
  } catch (transactionError) {
    await databaseClient.query("ROLLBACK");
    throw transactionError;
  } finally {
    databaseClient.release();
  }
  return findReportById(targetReportId);
}
