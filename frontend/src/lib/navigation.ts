export type PageKey = "dashboard" | "reports" | "users" | "rights" | "history";

export type NavigationItem = {
  pageKey: PageKey;
  label: string;
  requiredPermissionFeature: string;
};

export const navigationItems: NavigationItem[] = [
  {
    pageKey: "dashboard",
    label: "Dashboard",
    requiredPermissionFeature: "reports.view",
  },
  {
    pageKey: "reports",
    label: "Laporan",
    requiredPermissionFeature: "reports.view",
  },
  {
    pageKey: "history",
    label: "Riwayat",
    requiredPermissionFeature: "history.view",
  },
  {
    pageKey: "users",
    label: "Pengguna",
    requiredPermissionFeature: "users.manage",
  },
  {
    pageKey: "rights",
    label: "Hak Akses",
    requiredPermissionFeature: "rights.manage",
  },
];
