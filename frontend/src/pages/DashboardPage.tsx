import { useStats } from "../hooks/useReports";
import { usePermissions } from "../hooks/usePermissions";
import { Card } from "../components/ui/card";
import { ErrorState, LoadingState } from "../components/ui/state";

export function DashboardPage() {
  const { hasPermission } = usePermissions();
  const statisticsQuery = useStats();
  if (!hasPermission("reports.view"))
    return <LoadingState message="Tidak ada akses dashboard" />;
  if (statisticsQuery.isLoading) return <LoadingState />;
  if (statisticsQuery.isError)
    return (
      <ErrorState
        message={`Gagal: ${(statisticsQuery.error as Error).message}`}
      />
    );
  const statisticsData = statisticsQuery.data?.data ?? {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const statisticCards = [
    {
      label: "Total laporan",
      value: statisticsData.total,
      hint: "semua",
      badgeClass: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    },
    {
      label: "Pending",
      value: statisticsData.pending,
      hint: "menunggu",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    {
      label: "Approved",
      value: statisticsData.approved,
      hint: "disetujui",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    {
      label: "Rejected",
      value: statisticsData.rejected,
      hint: "ditolak",
      badgeClass: "bg-red-50 text-red-700 border border-red-200",
    },
  ];
  return (
    <>
      <div className="mb-3 flex items-center">
        <h2 className="text-base font-bold tracking-tight text-zinc-900">
          Dashboard
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statisticCards.map((statisticCard) => (
          <Card key={statisticCard.label} className="p-4">
            <div className="flex justify-end">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${statisticCard.badgeClass}`}
              >
                {statisticCard.hint}
              </span>
            </div>
            <div className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
              {statisticCard.value}
            </div>
            <div className="text-xs text-zinc-500">{statisticCard.label}</div>
          </Card>
        ))}
      </div>
    </>
  );
}
