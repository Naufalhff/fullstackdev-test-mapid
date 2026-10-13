import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllPermissions, updatePermission } from "../services/auth";

export function useRights() {
  return useQuery({ queryKey: ["rights"], queryFn: fetchAllPermissions });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      role: string;
      feature: string;
      allowed: boolean;
    }) => updatePermission(payload.role, payload.feature, payload.allowed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rights"] });
      queryClient.invalidateQueries({ queryKey: ["my-permissions"] });
      try {
        for (
          let storageIndex = 0;
          storageIndex < localStorage.length;
          storageIndex++
        ) {
          const storageKey = localStorage.key(storageIndex);
          if (storageKey && storageKey.startsWith("my-perms:"))
            localStorage.removeItem(storageKey);
        }
      } catch {}
    },
  });
}
