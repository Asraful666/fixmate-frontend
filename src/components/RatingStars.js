export default function RatingStars({ rating = 0, reviewCount = 0, className = "" }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value);

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <span className="text-amber-500" aria-hidden="true">
        {"★".repeat(rounded)}
        <span className="text-slate-300 dark:text-slate-600">
          {"★".repeat(5 - rounded)}
        </span>
      </span>

      {value > 0 ? (
        <span className="font-semibold text-slate-600">
          {value.toFixed(1)}
          {reviewCount > 0 && (
            <span className="font-normal text-slate-400"> ({reviewCount})</span>
          )}
        </span>
      ) : (
        <span className="text-slate-400">No reviews yet</span>
      )}
    </span>
  );
}
