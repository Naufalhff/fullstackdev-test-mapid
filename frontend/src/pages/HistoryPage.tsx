import { useState } from "react"
import { useHistory } from "../hooks/useHistory"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card } from "../components/ui/card"
import { ErrorState, LoadingState } from "../components/ui/state"
import { PaginationControl } from "../components/ui/pagination"

export function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const historyQuery = useHistory(currentPage, pageSize)

  if (historyQuery.isLoading) return <LoadingState />
  if (historyQuery.isError) return <ErrorState message={`Gagal: ${(historyQuery.error as Error).message}`} />
  const historyRows = historyQuery.data?.data ?? []
  const paginationMetadata = historyQuery.data?.pagination
  if (!historyRows.length) return <LoadingState message="Belum ada riwayat" />

  return (
    <>
      <div className="mb-3 flex items-center">
        <h2 className="text-base font-bold tracking-tight text-zinc-900">Riwayat Persetujuan</h2>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Laporan</TableHead>
              <TableHead>Perubahan</TableHead>
              <TableHead>Oleh</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRows.map((historyRow) => (
              <TableRow key={historyRow.id}>
                <TableCell className="font-normal text-zinc-900">{historyRow.report_nama}</TableCell>
                <TableCell className="text-zinc-600">{historyRow.old_status} → {historyRow.new_status}</TableCell>
                <TableCell className="text-zinc-600">{historyRow.decided_by_username}</TableCell>
                <TableCell className="text-xs text-zinc-500">{new Date(historyRow.decided_at).toLocaleString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {paginationMetadata && (
          <PaginationControl paginationMetadata={paginationMetadata} pageSize={pageSize} onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setCurrentPage(1) }} onPreviousPage={() => setCurrentPage((previousPage) => Math.max(1, previousPage - 1))} onNextPage={() => setCurrentPage((previousPage) => previousPage + 1)} isFetching={historyQuery.isFetching} />
        )}
      </Card>
    </>
  )
}
