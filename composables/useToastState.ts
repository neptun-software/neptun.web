import { DynamicToast } from '#components'
import { toast } from 'vue-sonner'
import { DynamicToastStates } from '~/components/loaders/dynamic/DynamicToastStates'

export function useToastState() {
  const toastIds = useState<Map<string, string | number>>('toast-ids', () => new Map())
  const toastTimeouts = useState<Map<string, NodeJS.Timeout>>('toast-timeouts', () => new Map())
  const toastPromises = useState<Map<string, Promise<unknown>>>('toast-promises', () => new Map())
  const isWaitingForResponse = useState<Map<string, boolean>>('is-waiting-for-response', () => new Map())

  const cleanup = () => {
    // Clear all timeouts and remove all toasts
    toastTimeouts.value.forEach(timeout => clearTimeout(timeout))
    toastTimeouts.value.clear()

    toastIds.value.forEach(id => toast.dismiss(id))
    toastIds.value.clear()

    toastPromises.value.clear()
    isWaitingForResponse.value.clear()
  }

  const removeToast = (requestId: string) => {
    if (toastIds.value.has(requestId)) {
      // Clear any existing timeout
      const existingTimeout = toastTimeouts.value.get(requestId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        toastTimeouts.value.delete(requestId)
      }

      toast.dismiss(toastIds.value.get(requestId))
      toastIds.value.delete(requestId)
      toastPromises.value.delete(requestId)
      isWaitingForResponse.value.delete(requestId)
    }
  }

  const showToast = (requestId: string, message: string) => {
    // Remove any existing toast with this ID first
    removeToast(requestId)

    const toastId = toast.custom(
      markRaw(defineComponent({
        setup() {
          return () => h(DynamicToast,
            {
              state: DynamicToastStates.LOADING,
            },
            {
              default: () => message,
            },
          )
        },
      })),
      {
        class: 'rounded-lg border border-border shadow-md',
        duration: Infinity,
      },
    )

    toastIds.value.set(requestId, toastId)

    return {
      success: (successMessage?: string) => {
        const id = toastIds.value.get(requestId)
        if (!id) {
          return
        }

        const duration = 2000
        toast.custom(
          markRaw(defineComponent({
            setup() {
              return () => h(DynamicToast,
                {
                  state: DynamicToastStates.SUCCESS,
                },
                {
                  default: () => successMessage ?? message,
                },
              )
            },
          })),
          {
            id,
            class: 'rounded-lg border border-border shadow-md',
            duration,
          },
        )

        // Set timeout to cleanup after the toast duration
        const timeout = setTimeout(() => removeToast(requestId), duration + 100)
        toastTimeouts.value.set(requestId, timeout)
      },
      error: (errorMessage: string) => {
        const id = toastIds.value.get(requestId)
        if (!id) {
          return
        }

        const duration = 3000
        toast.custom(
          markRaw(defineComponent({
            setup() {
              return () => h(DynamicToast,
                {
                  state: DynamicToastStates.ERROR,
                },
                {
                  default: () => errorMessage,
                },
              )
            },
          })),
          {
            id,
            class: 'rounded-lg border border-border shadow-md',
            duration,
          },
        )

        // Set timeout to cleanup after the toast duration
        const timeout = setTimeout(() => removeToast(requestId), duration + 100)
        toastTimeouts.value.set(requestId, timeout)
      },
    }
  }

  const setPromiseToast = (promise: Promise<unknown>, {
    loadingMessage,
    successMessage,
    errorMessage,
  }: {
    loadingMessage: string
    successMessage: string | ((data: unknown) => string)
    errorMessage: string | ((error: unknown) => string)
  }) => {
    // Clean up any existing state first
    cleanup()

    // Set up new state
    const requestId = crypto.randomUUID()
    toastPromises.value.set(requestId, promise)
    isWaitingForResponse.value.set(requestId, true)

    const toastHandler = showToast(requestId, loadingMessage)

    let resolveToastPromise: (value: unknown) => void
    let rejectToastPromise: (error: unknown) => void
    const toastPromise = new Promise<unknown>((resolve, reject) => {
      resolveToastPromise = resolve
      rejectToastPromise = reject
    })

    // Handle the original promise
    promise
      .then((data) => {
        if (toastPromises.value.get(requestId) === promise) { // Only update if this is still the current toast
          const message = typeof successMessage === 'function' ? successMessage(data) : successMessage
          toastHandler.success(message)
          // Wait for toast duration then resolve
          setTimeout(() => resolveToastPromise(data), 2000)
        }
      })
      .catch((error) => {
        if (toastPromises.value.get(requestId) === promise) { // Only update if this is still the current toast
          const message = typeof errorMessage === 'function' ? errorMessage(error) : errorMessage
          toastHandler.error(message)
          // Wait for toast duration then reject
          setTimeout(() => rejectToastPromise(error), 3000)
        }
      })
      .finally(() => {
        isWaitingForResponse.value.delete(requestId)
      })

    return {
      requestId,
      isWaiting: computed(() => isWaitingForResponse.value.get(requestId) ?? false),
      toastPromise,
    }
  }

  return {
    showToast,
    removeToast,
    setPromiseToast,
    cleanup,
  }
}
