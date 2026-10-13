export type Role = "admin" | "pelapor" | "approver";
export type ReportStatus = "pending" | "approved" | "rejected";

export type User = {
  id: number;
  username: string;
  role: Role;
  created_at: string;
};

export type AuthUser = {
  id: number;
  role: Role;
};

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
  old_status: string;
  new_status: string;
  decided_by: number;
  decided_at: string;
  decided_by_username: string;
  report_nama: string;
};
