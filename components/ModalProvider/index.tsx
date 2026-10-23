"use client"

import React, { Fragment, useEffect } from "react"
import {
  Dialog,
  Transition,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react"

import clsx from "clsx"
import X from "@/assets/svg/material-symbols-x-circle.svg"

interface ModalProviderProps {
  show?: boolean
  onClose?: (show: boolean) => void
  children: React.ReactNode
  dialogClass?: string
  closeBtn?: boolean
  unmount?: boolean
}

const ModalProvider = (props: ModalProviderProps) => {
  const handleClose = () => {
    props.onClose?.(false)
  }

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && props.show) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [props.show])

  return (
    <Transition appear show={props.show || false} as={Fragment}>
      <Dialog
        unmount={props.unmount}
        as="div"
        className="relative z-[100]"
        onClose={handleClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
        </TransitionChild>

        <div className="modal fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={clsx(
                  `modal-dialog shadow-base-1 w-fit transform overflow-hidden rounded-[0.8rem] text-left align-middle transition-all`,
                  props.dialogClass
                )}
              >
                {props?.closeBtn && (
                  <div
                    className="absolute top-2 right-2 z-10 h-[1.8rem] w-[1.8rem] cursor-pointer text-[--text-color-1] sm:h-[4rem] sm:w-[4rem]"
                    onClick={() => props.onClose?.(false)}
                  >
                    <X className="h-full w-full" />
                  </div>
                )}
                {props.children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ModalProvider
