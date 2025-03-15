export function useUiStore() {
  const $headerNavigationElement = useState<HTMLElement | null>(() => null)
  const { user } = useUserSession()

  const route = useRoute()
  const router = useRouter()

  const isZenMode = computed(() => route.query.layout === 'zen' && (route.name === 'Dashboard' || route.path === '/'))
  const toggleZenMode = async () => {
    const query = { ...route.query }
    if (isZenMode.value) {
      delete query.layout
    } else {
      query.layout = 'zen'
    }
    await router.replace({ query })
  }

  const defaultTabValues: Record<string, string> = {
    templates_main: 'templates',
    templates_view: 'paginated-pages',
    dashboard_chat: 'chat',
    project: 'create',
  }

  const getTabState = (key: string) => {
    const storageValue = useLocalStorage(
      localStorageTopicKey(`${user.value?.id ?? -1}:tab_${key}`),
      defaultTabValues[key] || '',
    )

    return computed(() => {
      const queryValue = route.query[`tab_${key}`] as string
      return queryValue || storageValue.value
    })
  }

  const setTabState = async (key: string, value: string) => {
    const query = { ...route.query }
    const queryKey = `tab_${key}`
    const storageKey = localStorageTopicKey(`${user.value?.id ?? -1}:tab_${key}`)

    if (value) {
      query[queryKey] = value
      localStorage.setItem(storageKey, value)
    } else {
      delete query[queryKey]
      localStorage.removeItem(storageKey)
    }
    await router.replace({ query })
  }

  return {
    $headerNavigationElement,
    isZenMode,
    toggleZenMode,
    getTabState,
    setTabState,
  }
}
