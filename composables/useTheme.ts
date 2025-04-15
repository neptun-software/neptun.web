export const useTheme = () => {
  const prefersDark = usePreferredDark()
  const colorMode = useColorMode()
  const selectedTheme = useState<ThemeOption>("selected-theme", () => themeOptions[0])

  const isDarkMode = computed(() => colorMode.value === 'dark')

  const currentTheme = computed(() => {
    if (!selectedTheme.value) return 'github-light'
    const themeKey = selectedTheme.value.value
    return isDarkMode.value ? themePairs[themeKey].dark : themePairs[themeKey].light
  })

  onMounted(() => {
    if (colorMode.value === 'system') {
      colorMode.value = prefersDark.value ? 'dark' : 'light'
    }
  })

  return {
    isDarkMode,
    selectedTheme,
    currentTheme,
    themeOptions
  }
}
