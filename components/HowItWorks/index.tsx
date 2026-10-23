import Container from "@/components/Container"
import SectionHeading from "@/components/SectionHeading"
import { steps } from "@/data/content"

export default function HowItWorks() {
  return (
    <section
      id="cach-dat-ve"
      className="border-y border-black/5 bg-white py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          center
          eyebrow="Cách đặt vé"
          title="4 bước từ chiếc điện thoại đến chuyến đò"
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-sand rounded-2xl p-6">
              <span className="bg-jade-600 mb-4 flex size-11 items-center justify-center rounded-full text-lg font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="text-ink/70 mt-2 text-base">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
