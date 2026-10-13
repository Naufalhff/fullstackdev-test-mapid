import * as React from "react";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto overscroll-x-contain">
      <table
        className={[
          "w-full min-w-160 caption-bottom text-sm md:min-w-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      className={[
        "bg-zinc-50/50 [&_tr]:border-b [&_tr]:border-zinc-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={["[&_tr:last-child]:border-0", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={["bg-zinc-50 font-medium", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={[
        "border-b border-zinc-100 transition-colors hover:bg-zinc-50/60 data-[state=selected]:bg-zinc-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={[
        "h-9 px-4 text-left align-middle text-xs font-medium tracking-wide text-zinc-500 has-[[role=checkbox]]:pr-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={[
        "px-4 py-3.5 align-middle text-sm has-[[role=checkbox]]:pr-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      className={["mt-4 text-sm text-zinc-500", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
