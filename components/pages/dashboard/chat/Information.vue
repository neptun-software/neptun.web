<script lang="ts" setup>
import { Check, ChevronsUpDown, Diff, Loader2 } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const { user } = useUserSession()
const { selectedAiChat, selectedAiChatIsPlayground } = useSelectedAiChat()
const { loadFiles, fetchedFiles } = useFetchFiles()
const {
  filetypeSearchIsOpen,
  filetypeSearchSelectedValue,
  filetypeSearchSelectableValues,
  selectedFileVersion,
  selectedFileVersionMarkdown,
  downloadFile,
  fileNameOfFileToDownload,
  fileToCompareTo,
  versionsForSelectedFileType,
} = useFiles()

const isLoading = ref(true)
onMounted(async () => {
  await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id).then(() => {
    isLoading.value = false
  })
})

const colorMode = useColorMode()
</script>

<template>
  <ShadcnScrollArea
    class="relative flex flex-col items-start order-2 h-[calc(100%-3.5rem)] gap-8 2xl:order-1"
  >
    <DashboardChatModelConfiguration />
    <fieldset class="flex flex-col gap-6 p-4 w-full h-full rounded-lg border">
      <legend class="px-1 -ml-1 text-sm font-medium">
        Code Blocks
      </legend>
      <div
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
        class="flex flex-wrap gap-3"
      >
        <div class="flex-grow">
          <ShadcnLabel>Filetype</ShadcnLabel>
          <ShadcnPopover v-model:open="filetypeSearchIsOpen">
            <ShadcnPopoverTrigger as-child>
              <ShadcnButton
                variant="outline"
                role="combobox"
                :aria-expanded="filetypeSearchIsOpen"
                class="justify-between w-full font-normal"
              >
                {{
                  filetypeSearchSelectedValue
                    ? filetypeSearchSelectableValues.find(
                      (option) => option.value === filetypeSearchSelectedValue,
                    )?.label
                    : 'Select filetype...'
                }}
                <ChevronsUpDown class="ml-2 w-3 h-3 opacity-50 shrink-0" />
              </ShadcnButton>
            </ShadcnPopoverTrigger>
            <ShadcnPopoverContent class="p-0 w-fit">
              <ShadcnCommand>
                <ShadcnCommandInput
                  class="h-9"
                  placeholder="Search filetype..."
                />
                <ShadcnCommandEmpty>Filetype not found.</ShadcnCommandEmpty>
                <ShadcnCommandList>
                  <ShadcnCommandGroup>
                    <ShadcnCommandItem
                      v-for="option in filetypeSearchSelectableValues"
                      :key="option.value"
                      :value="option.value"
                      @select="
                        (ev) => {
                          if (typeof ev.detail.value === 'string') {
                            filetypeSearchSelectedValue = ev.detail.value;
                          }
                          filetypeSearchIsOpen = false;
                        }
                      "
                    >
                      {{ option.label }}
                      <Check
                        :class="
                          cn(
                            'ml-auto h-4 w-4',
                            filetypeSearchSelectedValue === option.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )
                        "
                      />
                    </ShadcnCommandItem>
                  </ShadcnCommandGroup>
                </ShadcnCommandList>
              </ShadcnCommand>
            </ShadcnPopoverContent>
          </ShadcnPopover>
        </div>
        <div class="flex-grow">
          <DashboardChatFileVersionsSelect
            :is-disabled="filetypeSearchSelectedValue === ''"
          />
        </div>
      </div>
      <div
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
        class="flex flex-col gap-2 h-full"
      >
        <ShadcnLabel for="content">
          Content of the selected version:
          <template v-if="selectedFileVersion?.title">
            &nbsp;({{ selectedFileVersion?.title }})
          </template>
        </ShadcnLabel>
        <ShadcnScrollArea
          class="flex-grow max-w-full h-60 rounded-sm border bg-primary/10"
        >
          <template v-if="isLoading">
            <p class="px-4 py-4">
              <Loader2 class="w-4 h-4 animate-spin" />
            </p>
          </template>
          <template v-if="selectedFileVersion">
            <template v-if="!selectedFileVersion?.text">
              <p
                class="absolute top-1/2 left-1/2 px-1 transform -translate-x-1/2 -translate-y-1/2"
              >
                File is empty.
              </p>
            </template>
            <template v-else>
              <ClientOnly fallback-tag="div">
                <MarkdownRenderer :content="selectedFileVersionMarkdown" :unique-key="`chat-${selectedAiChat.id}-message-${selectedFileVersion.chat_conversation_message_id}-file-${selectedFileVersion.id}`" :use-simple-renderer="true" />
                <template #fallback>
                  <ShadcnSkeleton
                    class="absolute top-0 left-0 w-full h-full bg-slate-400"
                  />
                </template>
              </ClientOnly>
              <ShadcnTooltipProvider>
                <span class="flex absolute top-2 right-2 items-center">
                  <ShadcnDialog v-if="versionsForSelectedFileType.length > 1">
                    <ShadcnTooltip>
                      <ShadcnTooltipTrigger as-child>
                        <ShadcnDialogTrigger as-child>
                          <ShadcnButton variant="link" size="icon" class="w-6 h-6">
                            <Diff class="cursor-pointer text-foreground" />
                          </ShadcnButton>
                        </ShadcnDialogTrigger>
                      </ShadcnTooltipTrigger>
                      <ShadcnTooltipContent side="top">
                        Compare to File
                      </ShadcnTooltipContent>
                    </ShadcnTooltip>
                    <ShadcnDialogContent class="max-w-full max-h-full w-[90vw] h-[90vh] flex flex-col">
                      <ShadcnDialogHeader>
                        <ShadcnDialogTitle>Difference between versions</ShadcnDialogTitle>
                        <ShadcnDialogDescription>
                          Select a version to see the difference.
                        </ShadcnDialogDescription>
                      </ShadcnDialogHeader>

                      <DashboardChatFileVersionsSelect
                        :is-disabled="filetypeSearchSelectedValue === ''"
                        :include-diff="true"
                      />
                      <div class="flex-1 min-h-0 dark:bg-[#1e1e1e] light:bg-[#fffffe] p-2 rounded-lg">
                        <MonacoDiffEditor
                          v-model="fileToCompareTo"
                          :lang="selectedFileVersion?.language ?? 'text'"
                          class="h-full"
                          :original="selectedFileVersion.text"
                          :options="{
                            theme: colorMode.value === 'light' ? 'vs-light' : 'vs-dark',
                            useShadowDOM: true,
                          }"
                        >
                          Loading...
                        </MonacoDiffEditor>
                      </div>

                      <ShadcnDialogFooter class="flex gap-2 mt-4">
                        <div class="flex-shrink-0">
                          <ThemeToggle />
                        </div>

                        <div class="flex gap-2 ml-auto flex-shrink-1">
                          <ShadcnInput
                            v-model="fileNameOfFileToDownload"
                            placeholder="Enter filename"
                          />
                          <ShadcnButton
                            variant="secondary"
                            @click="downloadFile(fileToCompareTo)"
                          >
                            Download modified file
                          </ShadcnButton>
                          <ShadcnDialogClose as-child>
                            <ShadcnButton variant="secondary">Close</ShadcnButton>
                          </ShadcnDialogClose>
                        </div>
                      </ShadcnDialogFooter>
                    </ShadcnDialogContent>
                  </ShadcnDialog>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger as-child>
                      <CopyToClipboard :text="selectedFileVersion?.text" />
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent side="top">
                      Copy to Clipboard
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </span>
              </ShadcnTooltipProvider>
            </template>
          </template>
          <template v-else>
            <p
              class="absolute top-1/2 left-1/2 px-1 transform -translate-x-1/2 -translate-y-1/2"
            >
              Select a file above, to view it's content.
            </p>
          </template>
          <ShadcnScrollBar class="bg-accent dark:bg-accent/10" orientation="vertical" />
        </ShadcnScrollArea>
        <fieldset
          v-if="selectedFileVersion?.text"
          class="flex flex-col gap-6 p-4 w-full h-full rounded-lg border"
        >
          <legend class="px-1 -ml-1 text-sm font-medium">
            Options
          </legend>
          <div>
            <ShadcnLabel for="file-name">
              File Name
            </ShadcnLabel>
            <div class="flex flex-col">
              <ShadcnInput id="file-name" v-model="fileNameOfFileToDownload" />
              <ShadcnButton
                class="mt-1"
                @click="downloadFile(selectedFileVersion.text)"
              >
                Download
              </ShadcnButton>
            </div>
          </div>
        </fieldset>
      </div>
      <div v-else>
        <ClientOnly>
          <template v-if="selectedAiChatIsPlayground">
            <h4 class="font-bold">
              Snippets are only stored for persisted chats.
            </h4>
            <p>
              Click on "Persist Chat History", to generated and view code
              snippets.
            </p>
          </template>
          <template v-else>
            <h4 class="font-bold">
              No code snippets available for selected chat.
            </h4>
            <p>
              Chat with the AI, to generate and view generated code snippets.
            </p>
          </template>
          <template #fallback>
            <h4 class="font-bold">
              No fetched files available for selected chat.
            </h4>
            <p>
              Chat with the AI, to generate and view generated code snippets.
            </p>
          </template>
        </ClientOnly>
      </div>
    </fieldset>
  </ShadcnScrollArea>
</template>

<style scoped>
:deep(.remark-code-title) {
  display: none;
}
</style>
