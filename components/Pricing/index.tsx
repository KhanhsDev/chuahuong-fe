import Container from "@/components/Container"
import SectionHeading from "@/components/SectionHeading"
import { prices, vnd } from "@/data/content"

const rows = [
  { label: "Vé đò người lớn", ...prices.adult },
  { label: "Vé đò trẻ em", ...prices.child },
]

export default function Pricing() {
  return (
    <section id="gia-ve" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Giá vé"
          title="Giá rõ ràng, một vé cho cả lượt đi và lượt về"
          lead="Giá được Ban Quản lý ban hành theo từng ngày. Bảng dưới chỉ mang tính tham khảo."
        />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[48rem] text-left text-base">
            <thead className="bg-jade-50 text-jade-700">
              <tr>
                <th className="px-6 py-4">Loại vé</th>
                <th className="px-6 py-4">Ngày thường</th>
                <th className="px-6 py-4">Ngày lễ hội</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-6 py-4 font-semibold">{r.label}</td>
                  <td className="px-6 py-4">{vnd(r.weekday)}</td>
                  <td className="px-6 py-4">{vnd(r.festival)}</td>
                </tr>
              ))}
              <tr>
                <td className="px-6 py-4 font-semibold">Phụ phí bao thuyền</td>
                <td className="text-ink/70 px-6 py-4" colSpan={2}>
                  Tính trên một phương tiện, theo quy định của Ban Quản lý
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  )
}
