import { pool } from "../../db.js";
import type { HistoryRow } from "../../types.js";

const baseHistoryJoinClause = `FROM report_history h JOIN reports r ON r.id = h.report_id JOIN users u ON u.id = h.decided_by`;

export async function listHistory(
  currentPage: number,
  pageSize: number,
  authenticatedUser: { id: number; role: string },
): Promise<{ historyRows: HistoryRow[]; totalHistoryCount: number }> {
  const queryOffset = (currentPage - 1) * pageSize;
  const isPelaporRole = authenticatedUser.role === "pelapor";
  const whereClause = isPelaporRole ? "WHERE r.user_id=$3" : "";
  const listQueryParameters = isPelaporRole
    ? [pageSize, queryOffset, authenticatedUser.id]
    : [pageSize, queryOffset];
  const countQueryParameters = isPelaporRole
    ? [authenticatedUser.id]
    : ([] as unknown[]);
  const countQuerySql = isPelaporRole
    ? `SELECT COUNT(*)::text AS count ${baseHistoryJoinClause} WHERE r.user_id=$1`
    : `SELECT COUNT(*)::text AS count ${baseHistoryJoinClause}`;
  const [listQueryResult, countQueryResult] = await Promise.all([
    pool.query<HistoryRow>(
      `SELECT h.id, h.report_id, h.old_status, h.new_status, h.decided_by, h.decided_at, u.username AS decided_by_username, r.nama AS report_nama ${baseHistoryJoinClause} ${whereClause} ORDER BY h.decided_at DESC, h.id DESC LIMIT $1 OFFSET $2`,
      listQueryParameters as unknown[],
    ),
    pool.query<{ count: string }>(
      countQuerySql,
      countQueryParameters as unknown[],
    ),
  ]);
  return {
    historyRows: listQueryResult.rows,
    totalHistoryCount: Number(countQueryResult.rows[0].count),
  };
}
