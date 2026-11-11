import ReviewExperience from "@/components/Review/ReviewExperience"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <ReviewExperience token={token} />
}
