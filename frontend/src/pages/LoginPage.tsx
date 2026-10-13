import { useState } from "react";
import { toast } from "sonner";
import { login } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/field";
import { Button } from "../components/ui/button";

export function LoginPage() {
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [fieldValidationErrors, setFieldValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuthentication } = useAuth();

  async function handleSubmitLogin(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (!userName.trim()) validationErrors.username = "Username wajib diisi";
    if (!userPassword) validationErrors.password = "Password wajib diisi";
    if (Object.keys(validationErrors).length) {
      setFieldValidationErrors(validationErrors);
      return;
    }
    setFieldValidationErrors({});
    setIsSubmitting(true);
    try {
      const authenticationResult = await login({
        username: userName.trim(),
        password: userPassword,
      });
      setAuthentication(authenticationResult.token, authenticationResult.user);
      toast.success("Login berhasil");
    } catch (submitError) {
      const apiError = submitError as Error & {
        errors?: Record<string, string>;
      };
      if (apiError.errors) setFieldValidationErrors(apiError.errors);
      toast.error(apiError.message ?? "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-95 p-6">
        <h1 className="text-lg font-semibold text-zinc-900">Masuk Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Laporan Survei Pemetaan Lapangan
        </p>
        <form
          onSubmit={handleSubmitLogin}
          noValidate
          className="mt-4 grid gap-3"
        >
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
              placeholder="admin"
            />
            {fieldValidationErrors.username && (
              <span className="text-xs text-red-600" role="alert">
                {fieldValidationErrors.username}
              </span>
            )}
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-zinc-700">Password</label>
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
              placeholder="••••••••"
            />
            {fieldValidationErrors.password && (
              <span className="text-xs text-red-600" role="alert">
                {fieldValidationErrors.password}
              </span>
            )}
          </div>
          <Button disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? "Memproses" : "Masuk"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
