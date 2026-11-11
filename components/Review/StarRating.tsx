export default function StarRating({
  value,
  onChange,
  errorId,
}: {
  value: number
  onChange: (rating: number) => void
  errorId?: string
}) {
  return (
    <div
      role="group"
      aria-label="Chọn số sao"
      aria-describedby={errorId}
      className="flex flex-wrap gap-2"
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={`${rating} sao`}
          aria-pressed={value === rating}
          onClick={() => onChange(rating)}
          className={`min-h-[4.8rem] min-w-[4.8rem] rounded-xl border-2 text-3xl font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
            value >= rating
              ? "border-amber-600 bg-amber-100 text-amber-900"
              : "border-black/20 bg-white text-black/50"
          }`}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  )
}
