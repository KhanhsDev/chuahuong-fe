export class ApiError extends Error {
  status: number
  info: unknown

  constructor(message: string, status: number, info: unknown) {
    super(message)
    this.status = status
    this.info = info
  }
}

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  })

  if (!res.ok) {
    const info = await res.json().catch(() => null)
    throw new ApiError("Request failed", res.status, info)
  }

  return res.json()
}

export async function sender<T, B = unknown>(
  url: string,
  { arg }: { arg: { method?: "POST" | "PUT" | "PATCH" | "DELETE"; body?: B } }
): Promise<T> {
  const res = await fetch(url, {
    method: arg.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: arg.body ? JSON.stringify(arg.body) : undefined,
  })

  if (!res.ok) {
    const info = await res.json().catch(() => null)
    throw new ApiError("Request failed", res.status, info)
  }

  return res.json()
}
