export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="mt-5 font-semibold text-slate-600">Loading FixMate...</p>
      </div>
    </div>
  );
}
