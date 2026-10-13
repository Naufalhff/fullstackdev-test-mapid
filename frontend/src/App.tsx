import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportTable } from "./components/ReportTable";
import { UsersPage } from "./pages/UsersPage";
import { RightsPage } from "./pages/RightsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import { usePermissions } from "./hooks/usePermissions";
import { Button } from "./components/ui/button";
import { Confirm } from "./components/ui/modal";
import { ForbiddenState, LoadingState } from "./components/ui/state";
import { navigationItems } from "./lib/navigation";
import type { PageKey } from "./lib/navigation";
import "./styles.css";

export default function App() {
  const { authenticatedUser, logout } = useAuth();
  const { can: hasPermission, isLoading: isPermissionsLoading } =
    usePermissions();
  const [currentPageKey, setCurrentPageKey] = useState<PageKey>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!authenticatedUser) return <LoginPage />;

  function renderCurrentPage() {
    if (currentPageKey === "dashboard") {
      if (hasPermission("reports.view")) return <DashboardPage />;
    }
    if (currentPageKey === "reports") {
      if (hasPermission("reports.view")) return <ReportTable />;
    }
    if (currentPageKey === "users") {
      if (hasPermission("users.manage")) return <UsersPage />;
    }
    if (currentPageKey === "rights") {
      if (hasPermission("rights.manage")) return <RightsPage />;
    }
    if (currentPageKey === "history") {
      if (hasPermission("history.view")) return <HistoryPage />;
    }

    if (isPermissionsLoading) return <LoadingState />;
    const requiredFeature =
      navigationItems.find((item) => item.pageKey === currentPageKey)
        ?.requiredPermissionFeature ?? "";
    return <ForbiddenState requiredFeature={requiredFeature} />;
  }

  const visibleNavigationItems = navigationItems.filter((item) =>
    hasPermission(item.requiredPermissionFeature),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden h-screen shrink-0 md:block">
        <Sidebar
          active={currentPageKey}
          onNavigate={(selectedPageKey) =>
            setCurrentPageKey(selectedPageKey as PageKey)
          }
          collapsed={isSidebarCollapsed}
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 md:px-4">
          <button
            onClick={() =>
              setIsSidebarCollapsed((previousValue) => !previousValue)
            }
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 md:inline-flex"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 md:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
            Dashboard Laporan Survei Lapangan
          </h1>
          <Button
            variant="secondary"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="shrink-0"
          >
            Keluar
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          {renderCurrentPage()}
        </main>
      </div>
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative flex h-full w-70 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mapid text-xs font-bold text-white">
                  A
                </div>
                <span className="text-sm font-semibold text-zinc-900">
                  Administrator
                </span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-semibold tracking-widest text-zinc-400">
                WORKSPACE
              </div>
              {visibleNavigationItems.map((item) => (
                <button
                  key={item.pageKey}
                  onClick={() => {
                    setCurrentPageKey(item.pageKey);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`mb-1 flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${currentPageKey === item.pageKey ? "bg-emerald-50 text-emerald-700" : "text-zinc-600"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-zinc-200 p-3">
              <div className="flex items-center gap-2 rounded-xl border bg-zinc-50 px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mapid text-xs font-semibold text-white">
                  {authenticatedUser.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    {authenticatedUser.username}
                  </div>
                  <div className="text-xs capitalize text-zinc-500">
                    {authenticatedUser.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Confirm
        open={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        title="Keluar aplikasi?"
        desc="Sesi akan diakhiri dan perlu login kembali."
        confirmLabel="Keluar"
        variant="danger"
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
      />
    </div>
  );
}
