type Props = {
  eyebrow?: string
  title: string
  lead?: string
  center?: boolean
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  center,
}: Props) {
  return (
    <div
      className={center ? "mx-auto max-w-[72rem] text-center" : "max-w-[72rem]"}
    >
      {eyebrow && (
        <p className="text-brand-600 mb-2 text-sm font-bold tracking-widest uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold sm:text-4xl">{title}</h2>
      {lead && <p className="text-ink/70 mt-3 text-lg">{lead}</p>}
    </div>
  )
}
