export default function WaitingScreen({
  estimatedWaitSeconds,
  onStop,
}: {
  estimatedWaitSeconds: number
  onStop: () => void
}) {
  return (
    <section
      aria-live="polite"
      className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 text-ink sm:p-8"
    >
      <p className="text-sm font-bold tracking-widest text-amber-900 uppercase">
        Đang xếp lượt
      </p>
      <h2 className="mt-2 text-3xl font-extrabold">Đang chờ đò</h2>
      <p className="mt-3 text-lg">
        Dự kiến còn khoảng{" "}
        <strong>
          {Math.max(1, Math.ceil(estimatedWaitSeconds / 60))} phút
        </strong>
        . Hệ thống sẽ tự kiểm tra lại mỗi 5 giây và báo khi có đò.
      </p>
      <p className="mt-2 text-base">
        Khi có đò, thông tin sẽ hiện ngay trên màn hình này và bạn sẽ nhận được
        tin nhắn thông báo.
      </p>
      <div
        className="mt-6 h-3 overflow-hidden rounded-full bg-amber-200"
        role="status"
        aria-label="Đang kiểm tra lượt đò"
      >
        <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-700" />
      </div>
      <button
        type="button"
        onClick={onStop}
        className="mt-6 min-h-[4.8rem] w-full rounded-full border-2 border-amber-900 px-6 py-3 text-lg font-bold text-amber-950 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
      >
        Dừng chờ
      </button>
    </section>
  )
}
