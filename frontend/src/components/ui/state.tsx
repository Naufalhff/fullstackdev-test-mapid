export function LoadingState({ message = "Memuat" }: { message?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-red-700">
      {message}
    </div>
  );
}

export function ForbiddenState({
  requiredFeature,
}: {
  requiredFeature: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-red-700">
      Forbidden: butuh hak {requiredFeature}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
