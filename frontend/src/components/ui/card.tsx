import * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={["border-b border-zinc-200 bg-zinc-50/50 px-4 py-3", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={["text-xs font-medium tracking-wide text-zinc-500", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={[className].filter(Boolean).join(" ")} {...props} />;
}

export function StatIcon({
  tone = "green",
  children,
}: {
  tone?: "green" | "amber" | "violet" | "blue";
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-sky-50 text-sky-700",
  };
  return (
    <div
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs ${map[tone]}`}
    >
      {children}
    </div>
  );
}
