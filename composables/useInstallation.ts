export function useSelectedInstallation() {
  const selectedInstallationId = useState<number>(
    'selected-installation-id',
    () => -1,
  )
  return selectedInstallationId
}
