import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { navigationItems } from "../../lib/navigation";

export function Sidebar({
  active,
  onNavigate,
  collapsed,
}: {
  active: string;
  onNavigate: (selectedPageKey: string) => void;
  collapsed: boolean;
}) {
  const { authenticatedUser } = useAuth();
  const { can: hasPermission } = usePermissions();
  const visibleNavigationItems = navigationItems.filter((item) =>
    hasPermission(item.requiredPermissionFeature),
  );

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-60"} flex h-screen flex-col shrink-0 border-r border-zinc-200 bg-white transition-all`}
    >
      <div
        className={`flex h-14 items-center gap-2 border-b border-zinc-200 ${collapsed ? "justify-center px-2" : "px-3"}`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mapid text-xs font-bold text-white">
          A
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            Administrator
          </span>
        )}
      </div>
      <nav className="flex flex-1 flex-col overflow-hidden p-2">
        {!collapsed && (
          <div className="px-3 py-2 text-xs font-semibold tracking-widest text-zinc-400">
            WORKSPACE
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {visibleNavigationItems.map((item) => (
            <button
              key={item.pageKey}
              onClick={() => onNavigate(item.pageKey)}
              className={`mb-1 flex w-full items-center rounded-xl py-2.5 text-sm font-medium ${collapsed ? "justify-center px-2" : "px-3"} ${active === item.pageKey ? "bg-emerald-50 text-emerald-700" : "text-zinc-600 hover:bg-zinc-50"}`}
            >
              {!collapsed ? item.label : item.label[0]}
            </button>
          ))}
        </div>
        {authenticatedUser && (
          <div
            className={`mt-auto border-t border-zinc-200 ${collapsed ? "px-2 py-3" : "p-3"}`}
          >
            <div
              className={`flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 ${collapsed ? "justify-center" : ""}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mapid text-xs font-semibold text-white">
                {authenticatedUser.username[0].toUpperCase()}
              </div>
              {!collapsed && (
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    {authenticatedUser.username}
                  </div>
                  <div className="text-xs capitalize text-zinc-500">
                    {authenticatedUser.role}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
