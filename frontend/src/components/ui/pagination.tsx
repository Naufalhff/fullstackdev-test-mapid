import { Button } from "./button";

type PaginationMetaForUi = { total: number; page: number; pages: number };

export function PaginationControl({
  paginationMetadata,
  pageSize,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  isFetching,
}: {
  paginationMetadata: PaginationMetaForUi;
  pageSize: number;
  onPageSizeChange: (nextPageSize: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isFetching?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">Tampilkan</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-zinc-500">dari {paginationMetadata.total}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">
          Halaman {paginationMetadata.page} dari {paginationMetadata.pages || 1}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={paginationMetadata.page <= 1 || !!isFetching}
          onClick={onPreviousPage}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={
            paginationMetadata.page >= paginationMetadata.pages || !!isFetching
          }
          onClick={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
