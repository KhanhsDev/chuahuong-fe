import Container from "@/components/Container"
import SectionHeading from "@/components/SectionHeading"
import { faqs } from "@/data/content"

export default function Faq() {
  return (
    <section
      id="faq"
      className="border-t border-black/5 bg-white py-16 sm:py-24"
    >
      <Container className="max-w-[88rem]">
        <SectionHeading center eyebrow="Hỏi đáp" title="Câu hỏi thường gặp" />
        <div className="mt-10 divide-y divide-black/10 rounded-2xl border border-black/10">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span className="text-brand-600 text-2xl transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-ink/70 mt-3 text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
