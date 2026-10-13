import { useState } from "react";
import { toast } from "sonner";
import { usePatchStatus, useReports } from "../hooks/useReports";
import { StatusBadge } from "./StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Modal, Confirm } from "./ui/modal";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { ReportForm } from "./ReportForm";
import { ErrorState, LoadingState } from "./ui/state";
import { PaginationControl } from "./ui/pagination";

export function ReportTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const reportsQuery = useReports(currentPage, pageSize);
  const patchStatusMutation = usePatchStatus();
  const { authenticatedUser } = useAuth();
  const [confirmationTarget, setConfirmationTarget] = useState<null | {
    reportId: number;
    reportName: string;
  }>(null);
  const [editingReport, setEditingReport] = useState<null | {
    reportId: number;
    reportName: string;
    reportDescription: string;
  }>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  async function handleRejectConfirmation() {
    if (!confirmationTarget) return;
    const targetReportId = confirmationTarget.reportId;
    setConfirmationTarget(null);
    try {
      await patchStatusMutation.mutateAsync({
        id: targetReportId,
        status: "rejected",
      });
      toast.success("Laporan ditolak");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak");
    }
  }

  async function handleApproveReport(targetReportId: number) {
    try {
      await patchStatusMutation.mutateAsync({
        id: targetReportId,
        status: "approved",
      });
      toast.success("Laporan disetujui");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui");
    }
  }

  const { can: hasPermission } = usePermissions();
  const canApproveReports = hasPermission("reports.approve");
  const canCreateReports = hasPermission("reports.create");
  const canEditReports = hasPermission("reports.edit");

  if (reportsQuery.isLoading) return <LoadingState message="Memuat laporan" />;
  if (reportsQuery.isError)
    return (
      <ErrorState
        message={`Gagal memuat: ${(reportsQuery.error as Error).message}`}
      />
    );
  const reportRows = reportsQuery.data?.data ?? [];
  const paginationMetadata = reportsQuery.data?.pagination;

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold tracking-tight text-zinc-900">
          Daftar Laporan
        </h2>
        {canCreateReports && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Tambah laporan
          </Button>
        )}
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportRows.length ? (
              reportRows.map((reportRow) => {
                const isOwnerReport =
                  reportRow.user_id === authenticatedUser?.id;
                const canAdminEditPendingReport =
                  authenticatedUser?.role === "admin" &&
                  reportRow.status === "pending" &&
                  canEditReports;
                const canOwnerEditOwnPendingReport =
                  isOwnerReport &&
                  reportRow.status === "pending" &&
                  canEditReports;
                const shouldShowEditButton =
                  canOwnerEditOwnPendingReport || canAdminEditPendingReport;
                return (
                  <TableRow key={reportRow.id}>
                    <TableCell className="font-normal text-zinc-900">
                      {reportRow.nama}
                    </TableCell>
                    <TableCell className="max-w-90 whitespace-pre-wrap font-normal text-zinc-500">
                      {reportRow.deskripsi}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={reportRow.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {shouldShowEditButton && (
                          <Button
                            variant="pending"
                            size="sm"
                            onClick={() =>
                              setEditingReport({
                                reportId: reportRow.id,
                                reportName: reportRow.nama,
                                reportDescription: reportRow.deskripsi,
                              })
                            }
                          >
                            Edit
                          </Button>
                        )}
                        {canApproveReports &&
                          reportRow.status !== "approved" && (
                            <Button
                              variant="approved"
                              size="sm"
                              disabled={patchStatusMutation.isPending}
                              onClick={() => handleApproveReport(reportRow.id)}
                            >
                              Approve
                            </Button>
                          )}
                        {canApproveReports &&
                          reportRow.status !== "rejected" && (
                            <Button
                              variant="rejected"
                              size="sm"
                              disabled={patchStatusMutation.isPending}
                              onClick={() =>
                                setConfirmationTarget({
                                  reportId: reportRow.id,
                                  reportName: reportRow.nama,
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}
                        {!shouldShowEditButton &&
                          !(
                            canApproveReports &&
                            (reportRow.status === "pending" ||
                              reportRow.status === "approved" ||
                              reportRow.status === "rejected")
                          ) && <span className="text-zinc-500">-</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-zinc-500"
                >
                  Belum ada laporan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {paginationMetadata && (
          <PaginationControl
            paginationMetadata={paginationMetadata}
            pageSize={pageSize}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            onPreviousPage={() =>
              setCurrentPage((previousPage) => Math.max(1, previousPage - 1))
            }
            onNextPage={() =>
              setCurrentPage((previousPage) => previousPage + 1)
            }
            isFetching={reportsQuery.isFetching}
          />
        )}
      </Card>

      <Confirm
        open={!!confirmationTarget}
        onClose={() => setConfirmationTarget(null)}
        title="Tolak laporan?"
        desc={`${confirmationTarget?.reportName ?? ""} akan ditolak. Lanjut?`}
        onConfirm={handleRejectConfirmation}
        confirmLabel="Tolak"
        variant="danger"
      />

      <Modal
        open={!!editingReport}
        onClose={() => setEditingReport(null)}
        title="Edit laporan"
      >
        {editingReport && (
          <ReportForm
            initial={{
              id: editingReport.reportId,
              nama: editingReport.reportName,
              deskripsi: editingReport.reportDescription,
            }}
            onSuccess={() => setEditingReport(null)}
            onClose={() => setEditingReport(null)}
          />
        )}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah laporan"
      >
        <ReportForm
          onSuccess={() => setIsCreateModalOpen(false)}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </>
  );
}
