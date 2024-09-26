export const useUiStore = () => {
  const headerNavigationElement = useState<HTMLElement | null>(() => null);

  return {
    headerNavigationElement
  }
}
