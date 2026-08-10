export function ProductCardSkeleton() {
  return (
    <div className="pastel-card bg-base-panel border border-base-line p-5 animate-pulse">
      <div className="h-40 mb-4 rounded-sm bg-base-raised" />
      <div className="h-4 w-3/4 rounded bg-base-raised mb-2" />
      <div className="h-3 w-1/3 rounded bg-base-raised mb-3" />
      <div className="h-4 w-1/2 rounded bg-base-raised" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="pastel-card bg-base-panel border border-base-line p-5 animate-pulse space-y-3">
      <div className="h-4 w-1/3 rounded bg-base-raised" />
      <div className="h-3 w-2/3 rounded bg-base-raised" />
      <div className="h-3 w-1/2 rounded bg-base-raised" />
    </div>
  );
}

export function ListSkeleton({ rows = 4, Row = OrderRowSkeleton }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}
