import { useQuery } from "@tanstack/react-query";
import { fetchMyPermissions } from "../services/auth";
import { useAuth } from "./useAuth";
import type { Role } from "../lib/api";

const fallbackPermissionsByRole: Record<Role, Record<string, boolean>> = {
  admin: {
    "reports.view": true,
    "reports.create": true,
    "reports.edit": true,
    "reports.approve": true,
    "users.manage": true,
    "rights.manage": true,
    "history.view": true,
  },
  pelapor: {
    "reports.view": true,
    "reports.create": true,
    "reports.edit": true,
    "reports.approve": false,
    "users.manage": false,
    "rights.manage": false,
    "history.view": true,
  },
  approver: {
    "reports.view": true,
    "reports.create": false,
    "reports.edit": false,
    "reports.approve": true,
    "users.manage": false,
    "rights.manage": false,
    "history.view": true,
  },
};

export const fallbackPermissions = fallbackPermissionsByRole;

function readPermissionsCache(cacheKey: string) {
  try {
    const rawValue = localStorage.getItem(cacheKey);
    if (!rawValue) return undefined;
    const parsedValue = JSON.parse(rawValue) as Array<{
      feature: string;
      allowed: boolean;
    }>;
    return Array.isArray(parsedValue) ? parsedValue : undefined;
  } catch {
    return undefined;
  }
}

export function usePermissions() {
  const { authenticatedUser, authenticationToken } = useAuth();
  const permissionsCacheKey = authenticatedUser
    ? `my-perms:${authenticatedUser.id}`
    : "";
  const cachedPermissions = permissionsCacheKey
    ? readPermissionsCache(permissionsCacheKey)
    : undefined;
  const permissionsQuery = useQuery({
    queryKey: [
      "my-permissions",
      authenticatedUser?.id,
      authenticatedUser?.role,
    ],
    queryFn: async () => {
      const fetchedPermissions = await fetchMyPermissions();
      if (permissionsCacheKey)
        try {
          localStorage.setItem(
            permissionsCacheKey,
            JSON.stringify(fetchedPermissions),
          );
        } catch {}
      return fetchedPermissions;
    },
    enabled: !!authenticatedUser && !!authenticationToken,
    initialData: cachedPermissions,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
  const hasPermissionsData =
    !!permissionsQuery.data && permissionsQuery.data.length > 0;
  const permissionsByFeatureMap = new Map<string, boolean>(
    (permissionsQuery.data ?? []).map((permissionRow) => [
      permissionRow.feature,
      permissionRow.allowed,
    ]),
  );
  function hasPermission(requiredFeature: string) {
    if (hasPermissionsData)
      return permissionsByFeatureMap.get(requiredFeature) ?? false;
    if (permissionsQuery.isLoading) return false;
    if (permissionsQuery.isError && authenticatedUser) {
      const normalizedRole = String(
        authenticatedUser.role,
      ).toLowerCase() as Role;
      return (
        fallbackPermissionsByRole[normalizedRole]?.[requiredFeature] ?? false
      );
    }
    return false;
  }
  return {
    can: hasPermission,
    hasPermission,
    permissionsByFeatureMap,
    hasPermissionsData,
    isLoading: permissionsQuery.isLoading,
    isError: permissionsQuery.isError,
    error: permissionsQuery.error,
    refetch: permissionsQuery.refetch,
    fallbackPermissions: fallbackPermissionsByRole,
  };
}
