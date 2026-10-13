import { useState } from "react";
import { toast } from "sonner";
import type { AuthUser, Role } from "../lib/api";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { Input, Select } from "./ui/field";
import { Button } from "./ui/button";

export function UserForm({
  initial: initialUser,
  onSuccess: handleSuccess,
  onClose: handleClose,
}: {
  initial?: AuthUser;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const [userName, setUserName] = useState(initialUser?.username ?? "");
  const [userPassword, setUserPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>(
    initialUser?.role ?? "pelapor",
  );
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;
  const [fieldValidationErrors, setFieldValidationErrors] = useState<
    Record<string, string>
  >({});

  async function handleSubmitUser(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (!userName.trim()) validationErrors.username = "Username wajib diisi";
    if (!initialUser && (!userPassword || userPassword.length < 6))
      validationErrors.password = "Minimal 6 karakter";
    if (userPassword && userPassword.length > 0 && userPassword.length < 6)
      validationErrors.password = "Minimal 6 karakter";
    if (Object.keys(validationErrors).length) {
      setFieldValidationErrors(validationErrors);
      return;
    }
    setFieldValidationErrors({});
    try {
      if (initialUser)
        await updateUserMutation.mutateAsync({
          id: initialUser.id,
          username: userName.trim(),
          role: selectedRole,
          ...(userPassword ? { password: userPassword } : {}),
        });
      else
        await createUserMutation.mutateAsync({
          username: userName.trim(),
          password: userPassword,
          role: selectedRole,
        });
      toast.success(
        initialUser ? "Pengguna diperbarui" : "Pengguna ditambahkan",
      );
      if (!initialUser) {
        setUserName("");
        setUserPassword("");
      }
      handleSuccess?.();
    } catch (submitError) {
      const apiError = submitError as Error & {
        errors?: Record<string, string>;
      };
      if (apiError.errors) setFieldValidationErrors(apiError.errors);
      toast.error(apiError.message ?? "Gagal menyimpan");
    }
  }

  return (
    <form onSubmit={handleSubmitUser} noValidate className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="text-xs text-zinc-700">Username</label>
        <Input
          value={userName}
          onChange={(event) => {
            setUserName(event.target.value);
            if (fieldValidationErrors.username)
              setFieldValidationErrors((previousErrors) => ({
                ...previousErrors,
                username: "",
              }));
          }}
          error={Boolean(fieldValidationErrors.username)}
        />
        {fieldValidationErrors.username && (
          <p className="text-xs text-red-600" role="alert">
            {fieldValidationErrors.username}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs text-zinc-700">
          {initialUser
            ? "Password baru (kosongkan jika tidak ganti)"
            : "Password"}
        </label>
        <Input
          type="password"
          value={userPassword}
          onChange={(event) => {
            setUserPassword(event.target.value);
            if (fieldValidationErrors.password)
              setFieldValidationErrors((previousErrors) => ({
                ...previousErrors,
                password: "",
              }));
          }}
          error={Boolean(fieldValidationErrors.password)}
        />
        {fieldValidationErrors.password && (
          <p className="text-xs text-red-600" role="alert">
            {fieldValidationErrors.password}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs text-zinc-700">Role</label>
        <Select
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value as Role)}
        >
          <option value="pelapor">pelapor</option>
          <option value="approver">approver</option>
          <option value="admin">admin</option>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="flex-1"
        >
          {isSubmitting
            ? "Menyimpan"
            : initialUser
              ? "Simpan perubahan"
              : "Simpan pengguna"}
        </Button>
        {handleClose && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleClose}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
