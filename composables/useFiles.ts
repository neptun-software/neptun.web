import { uniqWith } from 'es-toolkit'

export function useFiles() {
  const { fetchedFiles } = useFetchFiles()

  /* FILE TYPE SEARCH */
  const filetypeSearchIsOpen = useState('filetype-search-is-open', () =>
    ref<boolean>(false))
  const filetypeSearchSelectedValue = useState('filetype-search-value', () =>
    ref<string>(''))

  /* VERSION SELECT */
  const selectedFileVersionId = useState('selected-file-version-id', () =>
    ref<string>(''))

  const versionsForSelectedFileType = computed(() => {
    return fetchedFiles.value.filter(
      file => file.language === filetypeSearchSelectedValue.value,
    )
  })

  const selectedFileVersion = computed(() => {
    return versionsForSelectedFileType.value.find(
      file => file.id === Number(selectedFileVersionId.value),
    )
  })

  /* DOWNLOADER */
  const fileNameOfFileToDownload = useState(
    'file-name-of-file-to-download',
    () => ref<string>(''),
  )

  const downloadFile = async (content?: string) => {
    let fileContent
      = selectedFileVersion.value
        ? selectedFileVersion.value.text
        : 'Failed to get file content!'
    if (content) {
      fileContent = content
    }

    await downloadAsFile(
      fileContent,
      fileNameOfFileToDownload.value,
      selectedFileVersion.value?.language ?? 'text/plain',
      selectedFileVersion.value?.extension ?? 'txt',
    )
  }

  const selectedFileVersionDate = computed(() => {
    return selectedFileVersion.value?.updated_at
      ? new Date(selectedFileVersion.value?.updated_at)
      : null
  })

  const selectedFileVersionMarkdown = computed(() => {
    return `\`\`\`${selectedFileVersion.value?.language}${selectedFileVersion.value?.title
      ? `:${selectedFileVersion.value?.title}`
      : ''
    }\n${selectedFileVersion.value?.text}\n\`\`\``
  })

  /* DIFF EDITOR */
  const fileToCompareTo = useState('file-to-compare-to', () => ref<string>(''))
  const versionsForSelectedFileTypeComparison = computed(() => {
    return versionsForSelectedFileType.value.filter(
      file => file.id !== Number(selectedFileVersionId.value),
    )
  })

  const selectedComparisonFileVersionId = useState(
    'selected-comparison-file-version-id',
    () => ref<string>(''),
  )

  const selectedComparisonFileVersion = computed(() => {
    return versionsForSelectedFileTypeComparison.value.find(
      file => file.id === Number(selectedComparisonFileVersionId.value),
    )
  })

  const selectedComparisonFileVersionDate = computed(() => {
    return selectedComparisonFileVersion.value?.updated_at
      ? new Date(selectedComparisonFileVersion.value?.updated_at)
      : null
  })

  const filetypeSearchSelectableValues = computed(() => {
    return uniqWith(
      fetchedFiles.value.map((file) => {
        return {
          value: file.language,
          label:
            supportedShikiLanguagesWithInfo.find(
              language => language.id === file.language,
            )?.name ?? 'Unknown',
        }
      }),
      (a, b) => a.value === b.value,
    )
  })

  watch(selectedFileVersionId, () => {
    if (selectedFileVersion.value) {
      fileNameOfFileToDownload.value = `${selectedFileVersion.value?.title
        ? `${selectedFileVersion.value?.title}-`
        : ''
      }${new Date(
        selectedFileVersion.value?.updated_at ?? Date.now(),
      ).getTime()}`
    }
  })

  watch(selectedComparisonFileVersionId, () => {
    fileToCompareTo.value = selectedComparisonFileVersion.value?.text ?? ''
  })

  return {
    fileToCompareTo,
    selectedComparisonFileVersionId,
    selectedComparisonFileVersionDate,
    versionsForSelectedFileTypeComparison,
    fileNameOfFileToDownload,
    downloadFile,
    filetypeSearchIsOpen,
    filetypeSearchSelectedValue,
    filetypeSearchSelectableValues,
    selectedFileVersionId,
    selectedFileVersion,
    selectedFileVersionDate,
    selectedFileVersionMarkdown,
    versionsForSelectedFileType,
  }
}
