export default defineNuxtPlugin((nuxtApp) => {
  const { user } = useUserSession()
  const router = useRouter()

  const routeTabKeys: Record<string, string[]> = {
    'Templates': ['templates_main', 'templates_view'],
    'Dashboard': ['dashboard_chat'],
    'New Project': ['project'],
  }

  nuxtApp.hooks.hook('app:mounted', () => {
    const route = router.currentRoute.value
    const relevantTabKeys = routeTabKeys[route.name as string] || []

    if (relevantTabKeys.length === 0) {
      return
    }

    const query = { ...route.query }
    let hasChanges = false

    for (const tabKey of relevantTabKeys) {
      const storageKey = localStorageTopicKey(`${user.value?.id ?? -1}:tab_${tabKey}`)
      const value = localStorage.getItem(storageKey)

      if (value && !query[`tab_${tabKey}`]) {
        query[`tab_${tabKey}`] = value
        hasChanges = true
      }
    }

    if (hasChanges) {
      void router.replace({ query })
    }
  })
})
