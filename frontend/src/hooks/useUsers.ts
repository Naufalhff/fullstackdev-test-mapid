import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../services/auth";
import type { Role } from "../lib/api";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { username: string; password: string; role: Role }) =>
      createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: number;
      username?: string;
      role?: Role;
      password?: string;
    }) =>
      updateUser(payload.id, {
        username: payload.username,
        role: payload.role,
        password: payload.password,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
