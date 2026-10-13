import * as React from "react";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "pending"
  | "approved"
  | "rejected";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary: "bg-mapid text-white hover:bg-mapid-600 border border-transparent",
  secondary: "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50",
  danger: "bg-red-700 text-white border border-transparent hover:bg-red-800",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-50 border border-transparent",
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
  approved:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
  rejected: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
};

const sizeCls: Record<Size, string> = {
  sm: "min-h-7 px-3 py-1 text-xs",
  md: "min-h-9 px-4 py-2 text-sm",
  lg: "min-h-11 px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-xl font-medium disabled:opacity-60",
        variantCls[variant],
        sizeCls[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
