export function useUiStore() {
  const $headerNavigationElement = useState<HTMLElement | null>(() => null)

  const route = useRoute()
  const router = useRouter()

  const isZenMode = computed(() => route.query.layout === 'zen' && (route.name === 'Dashboard' || route.path === '/'))
  const toggleZenMode = () => {
    const query = { ...route.query }
    if (isZenMode.value) {
      delete query.layout
    } else {
      query.layout = 'zen'
    }
    router.replace({ query })
  }

  return {
    $headerNavigationElement,
    isZenMode,
    toggleZenMode,
  }
}
