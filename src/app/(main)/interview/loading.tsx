/**
 * 면접 질문 로딩 스켈레톤
 */

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export default function InterviewLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>

      <div className="bg-white rounded-xl border p-6 mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-12 w-full rounded-xl mb-4" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-5">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
