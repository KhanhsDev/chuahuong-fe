import CheckinExperience from "@/components/Checkin/CheckinExperience"

type CheckinSearchParams = Promise<{
  code?: string | string[]
  phone?: string | string[]
}>

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: CheckinSearchParams
}) {
  const query = await searchParams
  const code = Array.isArray(query.code) ? query.code[0] : query.code
  const phone = Array.isArray(query.phone) ? query.phone[0] : query.phone

  return (
    <CheckinExperience initialCode={code ?? ""} initialPhone={phone ?? ""} />
  )
}
