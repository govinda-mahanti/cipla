import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const toastConfig = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const successToast = (message) => {
  toast.success(message, toastConfig)
}

export const errorToast = (message) => {
  toast.error(message, toastConfig)
}

export const infoToast = (message) => {
  toast.info(message, toastConfig)
}

export const warnToast = (message) => {
  toast.warn(message, toastConfig)
}