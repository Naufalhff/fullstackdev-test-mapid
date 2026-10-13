import * as React from "react";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-zinc-700">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <div className="h-0" />
      )}
    </div>
  );
}

export function Input({
  error,
  className,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean }) {
  return (
    <input
      className={[
        "w-full rounded-xl border bg-white px-3 py-2.5 text-sm",
        error ? "border-red-300" : "border-zinc-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function Textarea({
  error,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { error?: boolean }) {
  return (
    <textarea
      className={[
        "w-full resize-none overflow-auto rounded-xl border bg-white px-3 py-2.5 text-sm",
        error ? "border-red-300" : "border-zinc-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={[
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
