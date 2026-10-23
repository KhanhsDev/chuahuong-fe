import useSWR from "swr"
import { toast } from "sonner"
import { fetcher } from "./fetcher"
import { mutate, PublicConfiguration } from "swr/_internal"
import useSWRMutation from "swr/mutation"

import type { SWRMutationConfiguration } from "swr/mutation"
import { ApiResponse, METHOD } from "./global"
import { useSession } from "./useSession"
import axios from "axios"

interface WrapperConfig<T> extends Partial<
  PublicConfiguration<T, any, (arg: string) => any>
> {
  url?: string | (() => string)
  method?: METHOD
  body?: Record<string, unknown>
  auth?: boolean
  enable?: boolean
  noEndPoint?: boolean
  extraHeader?: Record<string, string>
  notification?: {
    notifyOnErr?: boolean
    title: string
    message?: string
  }
  ignoreSuccessNotification?: boolean
}

export function useSWRWrapper<T = Record<string, unknown>>(
  key: string | (() => string),
  {
    url,
    method,
    body,
    auth,
    noEndPoint,
    enable = true,
    notification = {
      notifyOnErr: true,
      title: "",
      message: "",
    },
    ignoreSuccessNotification = true,
    ...config
  }: WrapperConfig<ApiResponse<T>>
) {
  auth = auth ?? true

  const { token } = useSession()

  return useSWR<ApiResponse<T>>(
    enable ? (key ?? "") : null,
    () => {
      const extraHeader = (body as Record<string, unknown>)
        ?.extraHeader as Record<string, string>

      if (!(body instanceof FormData) && body?.extraHeader) {
        delete body.extraHeader
      }

      const header = {
        ...(auth &&
          token && {
            Authorization: `Bearer ${token}`,
          }),
        ...extraHeader,
        ...config?.extraHeader,
      }

      const urlKey: string =
        typeof url === "function"
          ? url()
          : url
            ? url
            : typeof key === "function"
              ? key()
              : key

      return new Promise((resolve, reject) => {
        fetcher<ApiResponse<T>>(
          urlKey,
          method ?? METHOD.GET,
          body,
          header,
          noEndPoint
          // signal,
        )
          .then((data) => {
            // if (!signal?.aborted) {
            resolve(data as never)
            // }
          })
          .catch((err) => {
            // if (!signal?.aborted) {
            reject(err as Error)
            // }
          })
      })
    },
    {
      ...config,
      onError(err, swrKey) {
        config?.onError?.(err, swrKey, config as never)
        if (notification?.notifyOnErr && notification?.title) {
          toast.error(notification.title, {
            description: extractErrorMessage(err),
          })
        }
      },
      onSuccess(data, swrKey) {
        config?.onSuccess?.(data, swrKey, config as never)
        if (notification && !ignoreSuccessNotification) {
          toast.success(notification.title, {
            description: notification.message,
          })
        }
      },
    }
  )
}

interface MutationConfig extends SWRMutationConfiguration<any, any> {
  url?: string | (() => string)
  method?: METHOD
  componentId?: string
  loading?: boolean
  noEndpoint?: boolean
  noAuth?: boolean
  extraHeader?: Record<string, string>
  resultKey?: string
  notification?: {
    title?: string
    message?: string
  }
  ignoreSuccessNotification?: boolean
}

export const useMutation = <T = Record<string, unknown>,>(
  key: string,
  {
    url,
    method,
    noEndpoint,
    resultKey,
    notification,
    ignoreSuccessNotification,
    ...config
  }: MutationConfig
) => {
  const { token } = useSession()

  return useSWRMutation(
    key,
    (
      swrKey: string,
      {
        arg: body,
        // signal,
      }: { arg?: Record<string, unknown> | FormData }
    ) =>
      new Promise<ApiResponse<T>>((resolve, reject) => {
        // if (signal?.aborted) {
        //   reject(new Error("Request aborted"));
        //   return;
        // }

        const extraHeader = (body as Record<string, unknown>)
          ?.extraHeader as Record<string, string>

        if (!(body instanceof FormData) && body?.extraHeader) {
          delete body.extraHeader
        }

        const urlKey = typeof url === "function" ? url() : (url ?? key)

        fetcher<ApiResponse<T>>(
          urlKey ?? swrKey,
          method ?? METHOD.POST,
          body as Record<string, unknown>,
          config.noAuth
            ? undefined
            : {
                ...(token && {
                  Authorization: `Bearer ${token}`,
                }),
                ...extraHeader,
                ...config?.extraHeader,
              },
          noEndpoint
        )
          .then((data) => {
            // if (!signal?.aborted) {
            resolve(data)
            if (resultKey) {
              mutate(resultKey, {
                success: true,
                response: data,
                request: body,
              })
            }
            // }
          })
          .catch((err) => {
            // if (!signal?.aborted) {
            reject(err as Error)
            if (resultKey) {
              mutate(resultKey, {
                success: false,
              })
            }
          })
          .finally(() => {})
      }),
    {
      onError(err, swrKey) {
        config?.onError?.(err, swrKey, config as never)
        if (notification) {
          toast.error(notification.title, {
            description: extractErrorMessage(err),
          })
        }
      },
      onSuccess(data, swrKey) {
        config?.onSuccess?.(data, swrKey, config as never)
        if (notification && !ignoreSuccessNotification) {
          toast.success(notification.title, {
            description: notification.message,
          })
        }
      },
    }
  )
}

const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.response?.data?.body ||
      err.message ||
      "Something went wrong"
    )
  }
  const error = err as ApiResponse<string>
  return error?.body || "Something went wrong"
}
