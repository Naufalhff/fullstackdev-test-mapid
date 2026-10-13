import { useState } from "react";
import { toast } from "sonner";
import { useCreateReport, useUpdateReport } from "../hooks/useReports";
import type { ApiError } from "../lib/api";
import { Input, Textarea } from "./ui/field";
import { Button } from "./ui/button";

type ReportFormInitialValues = { id: number; nama: string; deskripsi: string };

export function ReportForm({
  initial: initialReportValues,
  onSuccess: handleSuccess,
  onClose: handleClose,
}: {
  initial?: ReportFormInitialValues;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const [reportName, setReportName] = useState(initialReportValues?.nama ?? "");
  const [reportDescription, setReportDescription] = useState(
    initialReportValues?.deskripsi ?? "",
  );
  const [fieldValidationErrors, setFieldValidationErrors] = useState<
    Record<string, string>
  >({});
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();
  const isSubmitting =
    createReportMutation.isPending || updateReportMutation.isPending;

  async function handleSubmitReport(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (!reportName.trim()) validationErrors.nama = "Nama wajib diisi";
    if (!reportDescription.trim())
      validationErrors.deskripsi = "Deskripsi wajib diisi";
    if (Object.keys(validationErrors).length) {
      setFieldValidationErrors(validationErrors);
      return;
    }
    setFieldValidationErrors({});
    try {
      if (initialReportValues)
        await updateReportMutation.mutateAsync({
          id: initialReportValues.id,
          nama: reportName.trim(),
          deskripsi: reportDescription.trim(),
        });
      else
        await createReportMutation.mutateAsync({
          nama: reportName.trim(),
          deskripsi: reportDescription.trim(),
        });
      toast.success(
        initialReportValues ? "Laporan diperbarui" : "Laporan ditambahkan",
      );
      if (!initialReportValues) {
        setReportName("");
        setReportDescription("");
      }
      handleSuccess?.();
    } catch (submitError) {
      const apiError = submitError as ApiError;
      if (apiError.errors) setFieldValidationErrors(apiError.errors);
      toast.error(apiError.message ?? "Gagal menyimpan");
    }
  }

  return (
    <form onSubmit={handleSubmitReport} noValidate className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="text-xs text-zinc-700">Nama</label>
        <Input
          value={reportName}
          onChange={(event) => {
            setReportName(event.target.value);
            if (fieldValidationErrors.nama)
              setFieldValidationErrors((previousErrors) => ({
                ...previousErrors,
                nama: "",
              }));
          }}
          placeholder="Survei Lahan Blok A - Bandung Selatan"
          aria-invalid={Boolean(fieldValidationErrors.nama)}
          error={Boolean(fieldValidationErrors.nama)}
        />
        {fieldValidationErrors.nama && (
          <p className="text-xs text-red-600" role="alert">
            {fieldValidationErrors.nama}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs text-zinc-700">Deskripsi</label>
        <Textarea
          value={reportDescription}
          onChange={(event) => {
            setReportDescription(event.target.value);
            if (fieldValidationErrors.deskripsi)
              setFieldValidationErrors((previousErrors) => ({
                ...previousErrors,
                deskripsi: "",
              }));
          }}
          placeholder="Koordinat -6.95, 107.59, luas 1200m2"
          rows={3}
          aria-invalid={Boolean(fieldValidationErrors.deskripsi)}
          error={Boolean(fieldValidationErrors.deskripsi)}
        />
        {fieldValidationErrors.deskripsi && (
          <p className="text-xs text-red-600" role="alert">
            {fieldValidationErrors.deskripsi}
          </p>
        )}
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
            : initialReportValues
              ? "Simpan perubahan"
              : "Simpan laporan"}
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
