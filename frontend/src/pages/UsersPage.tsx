import { useState } from "react";
import { toast } from "sonner";
import type { AuthUser } from "../lib/api";
import { useDeleteUser, useUsers } from "../hooks/useUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Modal, Confirm } from "../components/ui/modal";
import { UserForm } from "../components/UserForm";
import { ErrorState, LoadingState } from "../components/ui/state";

export function UsersPage() {
  const usersQuery = useUsers();
  const deleteUserMutation = useDeleteUser();
  const userRows = usersQuery.data ?? [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [confirmationTargetUser, setConfirmationTargetUser] =
    useState<AuthUser | null>(null);

  async function handleDeleteUser() {
    if (!confirmationTargetUser) return;
    const targetUserId = confirmationTargetUser.id;
    setConfirmationTargetUser(null);
    try {
      await deleteUserMutation.mutateAsync(targetUserId);
      toast.success("Pengguna dihapus");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal hapus");
    }
  }

  if (usersQuery.isLoading) return <LoadingState />;
  if (usersQuery.isError)
    return (
      <ErrorState message={`Gagal: ${(usersQuery.error as Error).message}`} />
    );

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold tracking-tight text-zinc-900">
          Daftar Pengguna
        </h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="md"
          className="w-full sm:w-auto"
        >
          Tambah pengguna
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRows.length ? (
              userRows.map((userRow) => (
                <TableRow key={userRow.id}>
                  <TableCell className="font-normal text-zinc-900">
                    {userRow.username}
                  </TableCell>
                  <TableCell className="capitalize text-zinc-500">
                    {userRow.role}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingUser(userRow)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-red-700"
                        onClick={() => setConfirmationTargetUser(userRow)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-zinc-500"
                >
                  Belum ada pengguna
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah pengguna"
      >
        <UserForm
          onSuccess={() => setIsCreateModalOpen(false)}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit pengguna"
      >
        {editingUser && (
          <UserForm
            initial={editingUser}
            onSuccess={() => setEditingUser(null)}
            onClose={() => setEditingUser(null)}
          />
        )}
      </Modal>

      <Confirm
        open={!!confirmationTargetUser}
        onClose={() => setConfirmationTargetUser(null)}
        title="Hapus pengguna?"
        desc={`${confirmationTargetUser?.username ?? ""} akan dihapus. Lanjut?`}
        onConfirm={handleDeleteUser}
        confirmLabel="Hapus"
        variant="danger"
      />
    </>
  );
}
