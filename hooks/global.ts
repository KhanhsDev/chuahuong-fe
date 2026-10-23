export enum METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export type ApiResponse<T = Record<string, unknown> | string> = {
  headers: Record<string, string>
  data: T
  body: T
  statusCode: string
  statusCodeValue: number
}

export type ApiPagedResponse<T> = {
  data: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export const FILTER_ALL_VALUE = "__all__"

export type TYPE_OF_FILTER_ALL_VALUE = typeof FILTER_ALL_VALUE
