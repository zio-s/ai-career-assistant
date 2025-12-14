/**
 * 설정 페이지 로딩 스켈레톤
 */

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-8 w-24 mb-8" />

      <div className="bg-white rounded-xl border p-6 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
