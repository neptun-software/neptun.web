<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { Check, ChevronsUpDown, Loader2, Diff } from 'lucide-vue-next';

const { user } = useUserSession();
const { selectedAiChat, selectedAiChatIsPlayground } = useSelectedAiChat();
const { loadFiles, fetchedFiles } = useFetchFiles();
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
} = useFiles();

const isLoading = ref(true);
onMounted(async () => {
  await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id).then(() => {
    isLoading.value = false;
  });
});

const colorMode = useColorMode();
</script>

<template>
  <ShadcnScrollArea
    class="relative flex flex-col items-start order-2 h-[calc(100%-3.5rem)] gap-8 2xl:order-1"
  >
    <AiChatModelConfiguration />
    <fieldset class="flex flex-col w-full h-full gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">Code Blocks</legend>
      <div
        class="flex flex-wrap gap-3"
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
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
                        (option) => option.value === filetypeSearchSelectedValue
                      )?.label
                    : 'Select filetype...'
                }}
                <ChevronsUpDown class="w-3 h-3 ml-2 opacity-50 shrink-0" />
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
                              : 'opacity-0'
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
          <AiChatFileVersionsSelect
            :is-disabled="filetypeSearchSelectedValue === ''"
          />
        </div>
      </div>
      <div
        class="flex flex-col h-full gap-2"
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
      >
        <ShadcnLabel for="content"
          >Content of the selected version:
          <template v-if="selectedFileVersion?.title">
            &nbsp;({{ selectedFileVersion?.title }})
          </template></ShadcnLabel
        >
        <ShadcnScrollArea
          class="flex-grow max-w-full border rounded-sm h-60 bg-primary/10"
        >
          <template v-if="isLoading">
            <p class="px-4 py-4">
              <Loader2 class="w-4 h-4 animate-spin" />
            </p>
          </template>
          <template v-if="selectedFileVersion">
            <template v-if="!selectedFileVersion?.text">
              <p
                class="absolute px-1 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              >
                File is empty.
              </p>
            </template>
            <template v-else>
              <ClientOnly fallback-tag="div">
                <MDC :value="selectedFileVersionMarkdown" />
                <template #fallback>
                  <ShadcnSkeleton
                    class="absolute top-0 left-0 w-full h-full bg-slate-400"
                  />
                </template>
              </ClientOnly>
              <span class="absolute flex items-center top-2 right-2">
                <ShadcnDialog v-if="versionsForSelectedFileType.length > 1">
                  <ShadcnDialogTrigger as-child>
                    <ShadcnButton variant="link" size="icon" as-child>
                      <template>
                        <Diff class="w-5 h-5 cursor-pointer text-foreground" />
                      </template>
                    </ShadcnButton>
                  </ShadcnDialogTrigger>
                  <ShadcnDialogContent>
                    <ShadcnDialogHeader>
                      <ShadcnDialogTitle
                        >Difference between versions</ShadcnDialogTitle
                      >
                      <ShadcnDialogDescription>
                        Select a version to see the difference.
                      </ShadcnDialogDescription>
                    </ShadcnDialogHeader>

                    <AiChatFileVersionsSelect
                      :is-disabled="filetypeSearchSelectedValue === ''"
                      :include-diff="true"
                    />
                    <MonacoDiffEditor
                      class="h-96"
                      :original="selectedFileVersion.text"
                      v-model="fileToCompareTo"
                      :options="{
                        theme:
                          colorMode.value === 'light' ? 'vs-light' : 'vs-dark',
                      }"
                    >
                      Loading...
                    </MonacoDiffEditor>

                    <ShadcnDialogFooter>
                      <ShadcnButton
                        type="button"
                        variant="secondary"
                        @click="downloadFile(fileToCompareTo)"
                      >
                        Download modified file
                      </ShadcnButton>
                      <ShadcnDialogClose as-child>
                        <ShadcnButton type="button" variant="secondary">
                          Close
                        </ShadcnButton>
                      </ShadcnDialogClose>
                    </ShadcnDialogFooter>
                  </ShadcnDialogContent>
                </ShadcnDialog>
                <CopyToClipboard :text="selectedFileVersion?.text" />
              </span>
            </template>
          </template>
          <template v-else>
            <p
              class="absolute px-1 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
              Select a file above, to view it's content.
            </p>
          </template>
          <ShadcnScrollBar class="bg-primary" orientation="horizontal" />
          <ShadcnScrollBar class="bg-primary" orientation="vertical" />
        </ShadcnScrollArea>
        <fieldset
          v-if="selectedFileVersion?.text"
          class="flex flex-col w-full h-full gap-6 p-4 border rounded-lg"
        >
          <legend class="px-1 -ml-1 text-sm font-medium">Options</legend>
          <div>
            <ShadcnLabel for="file-name"> File Name </ShadcnLabel>
            <div class="flex flex-col">
              <ShadcnInput id="file-name" v-model="fileNameOfFileToDownload" />
              <ShadcnButton class="mt-1" @click="downloadFile">
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
