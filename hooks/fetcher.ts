/* eslint-disable @typescript-eslint/no-explicit-any */
import { METHOD } from "./global"
import axiosInstance from "@/lib/axiosInstance"

export const replacePlaceholder = (
  s: string,
  data: Record<string, unknown>
) => {
  const parts = s.split(/{(.*?)}/g).map((v) => {
    const replaced = v.replace(/{/g, "")

    if (data instanceof FormData) {
      return data.get(replaced) || replaced
    }

    return data[replaced] || replaced
  })

  return parts.join("")
}

export const fetcher = async <T = any>(
  url: string,
  method: METHOD,
  body?: Record<string, unknown> | FormData,
  headers?: Record<string, string>,
  noEndPoint?: boolean
): Promise<T> => {
  let parsedUrl = `${noEndPoint ? "" : ""}${url}`
  parsedUrl = replacePlaceholder(
    parsedUrl,
    (body as unknown as Record<string, unknown>) || {}
  )

  const isFormData = body instanceof FormData

  const response = await axiosInstance.request<T>({
    url: parsedUrl,
    method,
    baseURL: noEndPoint ? "" : undefined,
    params: method === METHOD.GET && body ? body : undefined,
    data: method !== METHOD.GET ? body : undefined,
    headers: {
      ...headers,
      ...(!isFormData && { "Content-Type": "application/json; charset=UTF-8" }),
    },
  })

  return response.data
}
