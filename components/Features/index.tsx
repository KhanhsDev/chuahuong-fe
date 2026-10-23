import Container from "@/components/Container"
import SectionHeading from "@/components/SectionHeading"
import { features } from "@/data/content"

export default function Features() {
  return (
    <section className="border-y border-black/5 bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Vì sao đặt vé online"
          title="Chuyến đi nhẹ nhàng hơn"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-sand rounded-2xl border border-black/10 p-6"
            >
              <div className="text-3xl" aria-hidden>
                {f.icon}
              </div>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="text-ink/70 mt-1 text-base">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
