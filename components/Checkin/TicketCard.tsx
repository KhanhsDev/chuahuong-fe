import dayjs from "dayjs"
import { QRCodeSVG } from "qrcode.react"

import { routes } from "@/data/content"
import type { BoatAssignment, CheckinOrder } from "@/interface/common"

import styles from "./TicketCard.module.css"

export default function TicketCard({
  assignment,
  order,
  index,
  total,
}: {
  assignment: BoatAssignment
  order: CheckinOrder
  index: number
  total: number
}) {
  const route = routes.find((candidate) => candidate.id === order.routeId)

  return (
    <article
      className={`${styles.printArea} rounded-3xl border-2 border-jade-700 bg-white p-5 text-ink shadow-sm sm:p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold tracking-widest text-jade-700 uppercase">
            Vé đò · Mỗi đoàn một vé
          </p>
          {total > 1 && (
            <p className="mt-1 text-base font-bold text-ink/70">
              Đò {index + 1}/{total}
            </p>
          )}
        </div>
        <div className="rounded-full bg-jade-50 px-3 py-1 text-sm font-bold text-jade-900">
          {order.code}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid grid-cols-2 gap-3">
          <NumberPanel label="Số hiệu đò" value={assignment.boat.id} />
          <NumberPanel label="Số cổng" value={String(assignment.boat.gate)} />
        </div>
        <div className="flex justify-center rounded-2xl bg-white p-3">
          <QRCodeSVG
            value={assignment.qrCode}
            size={150}
            level="H"
            title={`Mã QR vé ${assignment.qrCode}`}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-base sm:grid-cols-2">
        <p>
          <strong>Người lái đò: </strong>
          <a
            href={`tel:${assignment.boat.driverPhone}`}
            className="font-bold text-jade-700 underline underline-offset-2"
          >
            {assignment.boat.driverPhone}
          </a>
        </p>
        <p>
          <strong>Tuyến: </strong>
          {route?.name ?? "Tuyến tham quan"}
        </p>
        <p>
          <strong>Ngày đi: </strong>
          {dayjs(order.date).format("DD/MM/YYYY")}
        </p>
        <p>
          <strong>Số khách: </strong>
          {assignment.adults} người lớn · {assignment.children} trẻ em
        </p>
      </div>
      <p className="mt-5 rounded-2xl bg-jade-50 p-4 text-base font-semibold text-jade-900">
        Ra đúng cổng, tìm đò có số hiệu này, đưa vé cho người lái đò quét.
      </p>
    </article>
  )
}

function NumberPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-32 flex-col justify-center rounded-2xl bg-jade-900 p-4 text-center text-white">
      <span className="text-sm font-bold uppercase">{label}</span>
      <strong
        className={`${styles.numberValue} mt-1 text-[6rem] leading-none font-black tracking-tight`}
      >
        {value}
      </strong>
    </div>
  )
}
