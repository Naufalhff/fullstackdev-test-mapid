import * as React from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxW = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxW?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxW} rounded-xl border border-zinc-200 bg-white p-4 shadow-xl`}
      >
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Confirm({
  open,
  onClose,
  title,
  desc,
  onConfirm,
  confirmLabel = "Hapus",
  variant = "danger",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <p className="mt-2 text-sm text-zinc-500">{desc}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            ref={ref}
            onClick={onClose}
            className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "min-h-11 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                : "min-h-11 rounded-xl bg-mapid px-4 py-2 text-sm font-semibold text-white hover:bg-mapid-600"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
