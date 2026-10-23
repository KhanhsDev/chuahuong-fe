"use client"

import { useState } from "react"

export const useModal = <T = Record<string, unknown>>(initial?: {
  show: boolean
  data?: T
}) => {
  const [modal, setModal] = useState(initial)

  const handleShow = (data?: T) => {
    setModal({ show: true, data })
  }
  const handleHide = () => {
    setModal((prev) => ({ ...prev, show: false }))
  }

  return {
    show: modal?.show,
    handleShow,
    handleHide,
    data: modal?.data,
  }
}
