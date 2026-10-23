const Stepper = ({
  value,
  onChange,
  min = 0,
  canIncrease,
  name,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  canIncrease: boolean
  name: string
}) => {
  return (
    <div className="flex items-center gap-[1.2rem]">
      <button
        type="button"
        className="flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-full border border-[#c9d6d1] text-[2rem] leading-none text-[#17302b] transition-colors hover:bg-[#eaf1ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4b43] disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={`Giảm số ${name}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span
        className="w-[2.4rem] text-center text-[1.7rem] font-bold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className="flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-full border border-[#c9d6d1] text-[2rem] leading-none text-[#17302b] transition-colors hover:bg-[#eaf1ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4b43] disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={`Tăng số ${name}`}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
export default Stepper
