import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { ErrorState, LoadingState } from "../components/ui/state";
import { useRights, useUpdatePermission } from "../hooks/useRights";

const availableFeatures = [
  "reports.view",
  "reports.create",
  "reports.edit",
  "reports.approve",
  "users.manage",
  "rights.manage",
  "history.view",
];
const featureLabels: Record<string, string> = {
  "reports.view": "Laporan - lihat",
  "reports.create": "Laporan - buat",
  "reports.edit": "Laporan - edit pending",
  "reports.approve": "Approve / Reject",
  "users.manage": "Pengguna",
  "rights.manage": "Hak Akses",
  "history.view": "Riwayat",
};
const availableRoles = ["admin", "pelapor", "approver"];

export function RightsPage() {
  const permissionsQuery = useRights();
  const updatePermissionMutation = useUpdatePermission();
  const permissionRows = permissionsQuery.data ?? [];

  function isFeatureAllowed(targetRole: string, targetFeature: string) {
    return (
      permissionRows.find(
        (permissionRow) =>
          permissionRow.role === targetRole &&
          permissionRow.feature === targetFeature,
      )?.allowed ?? false
    );
  }

  async function handleTogglePermission(
    targetRole: string,
    targetFeature: string,
    currentAllowed: boolean,
  ) {
    try {
      await updatePermissionMutation.mutateAsync({
        role: targetRole,
        feature: targetFeature,
        allowed: !currentAllowed,
      });
      toast.success("Hak akses diperbarui");
    } catch (toggleError) {
      toast.error(toggleError instanceof Error ? toggleError.message : "Gagal");
    }
  }

  if (permissionsQuery.isLoading) return <LoadingState />;
  if (permissionsQuery.isError)
    return (
      <ErrorState
        message={`Gagal: ${(permissionsQuery.error as Error).message}`}
      />
    );

  return (
    <>
      <div className="mb-3 flex items-center">
        <h2 className="text-base font-bold tracking-tight text-zinc-900">
          Hak Akses
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hak Akses - admin atur toggle per role</CardTitle>
        </CardHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
              <th className="px-4 py-2">Fitur</th>
              {availableRoles.map((roleName) => (
                <th key={roleName} className="px-4 py-2 capitalize">
                  {roleName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableFeatures.map((featureName) => (
              <tr
                key={featureName}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-4 py-3 text-zinc-900">
                  {featureLabels[featureName]}
                </td>
                {availableRoles.map((roleName) => (
                  <td key={roleName} className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleTogglePermission(
                          roleName,
                          featureName,
                          isFeatureAllowed(roleName, featureName),
                        )
                      }
                      disabled={updatePermissionMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isFeatureAllowed(roleName, featureName) ? "bg-mapid" : "bg-zinc-200"} disabled:opacity-60`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isFeatureAllowed(roleName, featureName) ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
