"use client"

import { useSyncExternalStore } from "react"

let isLoginModalOpen = false

const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

export const loginModal = {
  open() {
    if (isLoginModalOpen) return

    isLoginModalOpen = true
    notifyListeners()
  },
  close() {
    if (!isLoginModalOpen) return

    isLoginModalOpen = false
    notifyListeners()
  },
}

export const useLoginModalOpen = () => {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => isLoginModalOpen,
    () => false
  )
}
