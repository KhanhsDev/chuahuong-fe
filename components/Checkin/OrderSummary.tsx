import { routes } from '@/data/content';
import type { CheckinOrder } from '@/interface/common';
import dayjs from 'dayjs';

export default function OrderSummary({
  order,
  onConfirm,
  isLoading,
}: {
  order: CheckinOrder;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const route = routes.find((candidate) => candidate.id === order.routeId);
  const guestCount = order.adults + order.children;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 text-ink shadow-sm sm:p-8">
      <p className="text-sm font-bold tracking-widest text-jade-700 uppercase">
        Bước 2 · Xác nhận đơn
      </p>
      <h2 className="mt-2 text-3xl font-extrabold">Thông tin chuyến đi</h2>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Người mua" value={order.buyerName} />
        <SummaryItem label="Mã đặt vé" value={order.code} />
        <SummaryItem label="Tuyến tham quan" value={route?.name ?? 'Tuyến tham quan'} />
        <SummaryItem label="Ngày sử dụng" value={dayjs(order.date).format('DD/MM/YYYY')} />
        <SummaryItem
          label="Số lượng khách"
          value={`${order.adults} người lớn · ${order.children} trẻ em (${guestCount} khách)`}
        />
        <SummaryItem
          label="Hình thức"
          value={order.mode === 'charter' ? 'Bao thuyền' : 'Ghép đò'}
        />
      </dl>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className="mt-7 min-h-[4.8rem] w-full rounded-full bg-jade-700 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-jade-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-jade-700 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? 'Đang xếp đò…' : 'Xác nhận và nhận đò'}
      </button>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sand p-4">
      <dt className="text-sm font-semibold text-ink/70">{label}</dt>
      <dd className="mt-1 text-lg font-bold">{value}</dd>
    </div>
  );
}
