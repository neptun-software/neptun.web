import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  const { console } = useLogger()

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    let errorMessage = 'Unknown error'

    if (IS_DEV) {
      try {
        const errorObj = error instanceof Error ? error.message : String(error)
        errorMessage += ` (${errorObj})`
      } catch {
        errorMessage += ` (${String(error)})`
      }
    }

    toast.error(errorMessage)
    if (IS_DEV) {
      console.error(error, instance, info)
    }
  }
})
