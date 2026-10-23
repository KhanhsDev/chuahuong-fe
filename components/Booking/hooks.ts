import { METHOD } from "@/hooks/global"
import { useSWRWrapper } from "@/hooks/swr"

export const testAPI = () => {
  const getListUsers = useSWRWrapper<any>(`healthz`, {
    url: "healthz",
    method: METHOD.GET,
    auth: false,
  })
  return {
    getListUsers,
  }
}
