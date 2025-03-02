<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { Download, Eye, EyeOff } from 'lucide-vue-next'

const { selectedAiChat } = useSelectedAiChat()
const { user } = useUserSession()

const { data, error } = await useFetch(
  `/api/users/${user.value?.id ?? -1}/cli`,
)

const cookieVisible = ref(false)
const markdownEl = ref(null)
const cookieMask = '•'.repeat(40)

const toggleCookieVisibility = () => {
  cookieVisible.value = !cookieVisible.value
  
  nextTick(() => {
    const lines = markdownEl.value?.querySelectorAll('.line')
    if (!lines) return
    
    for (const line of lines) {
      if (line.textContent.includes('neptun_session_cookie')) {
        const spans = line.querySelectorAll('span')
        for (const span of spans) {
          if (span.textContent.includes('"neptun_session_cookie"')) {
            let currentSpan = span.nextElementSibling
            while (currentSpan) {
              if (currentSpan.textContent.includes('"') && 
                  (currentSpan.textContent.includes('•') || 
                   currentSpan.textContent.includes(data.value?.auth?.neptun_session_cookie))) {
                if (cookieVisible.value) {
                  currentSpan.textContent = `"${data.value?.auth?.neptun_session_cookie}"`
                } else {
                  currentSpan.textContent = `"${cookieMask}"`
                }
                return
              }
              currentSpan = currentSpan.nextElementSibling
            }
          }
        }
      }
    }
  })
}

const selectedAiChatId = computed(() => selectedAiChat.value.id)
const selectedAiChatName = computed(() => selectedAiChat.value.name)
const selectedAiChatModel = computed(() => selectedAiChat.value.model)
const cliConfigurationToCopy = computed(() => {
  return {
    ...data.value,
    active_chat: {
      chat_id: selectedAiChatId.value,
      chat_name: selectedAiChatName.value,
      model: selectedAiChatModel.value,
    },
  }
})

const cliConfigurationMarkdown = computed(() => {
  const configCopy = JSON.parse(JSON.stringify(cliConfigurationToCopy.value))
  
  if (configCopy?.auth?.neptun_session_cookie) {
    configCopy.auth.neptun_session_cookie = cookieMask
  }
  
  return `\`\`\`json\n${JSON.stringify(
    configCopy,
    null,
    2,
  )}\n\`\`\``
})

const textForClipboard = computed(() => {
  return JSON.stringify(cliConfigurationToCopy.value, null, 2)
})

const pipInstallCommand = 'pip install neptun'

async function downloadConfiguration() {
  await downloadAsFile(cliConfigurationToCopy.value, 'neptun-config', 'application/json', 'json')
}
</script>

<template>
  <div>
    <div class="overflow-hidden relative my-2 rounded-lg border bg-background border-slate-200 dark:border-border">
      <ShadcnScrollArea class="max-w-[calc(100vw-(1rem))] px-2 py-2">
        <ShadcnScrollBar orientation="horizontal" />
        <div ref="markdownEl">
          <ClientOnly fallback-tag="div">
            <MarkdownRenderer :content="cliConfigurationMarkdown" />
            <template #fallback>
              <ShadcnSkeleton class="my-2 w-full h-10 bg-slate-400" />
            </template>
            <template v-if="error">
              <p class="text-red-500">
                Failed to fetch CLI configuration.
              </p>
            </template>
            <span class="flex absolute top-2 right-2 gap-2 items-center">
              <ShadcnButton 
                size="icon" 
                variant="ghost" 
                @click="toggleCookieVisibility"
                title="Toggle session cookie visibility"
              >
                <span v-if="cookieVisible">
                  <EyeOff class="size-5" />
                </span>
                <span v-else>
                  <Eye class="size-5" />
                </span>
              </ShadcnButton>
              
              <AsyncButton
                size="icon" variant="ghost" :hide-loader="true" :is-disabled="textForClipboard === ''"
                :on-click-async="downloadConfiguration"
              >
                <Download class="size-6" />
              </AsyncButton>

              <ShadcnButton size="icon" variant="ghost" :disabled="textForClipboard === ''">
                <CopyToClipboard :text="textForClipboard" />
              </ShadcnButton>
            </span>
          </ClientOnly>
        </div>
      </ShadcnScrollArea>
    </div>

    <div>
      <div class="p-4 mt-2 rounded-lg border bg-background border-slate-200 dark:border-border">
        <h3 class="mb-3 text-lg font-medium">
          Install CLI Tool
        </h3>

        <div class="mb-4">
          <a
            href="https://pypi.org/project/neptun" target="_blank" rel="noopener noreferrer"
            class="flex items-center text-primary hover:underline"
          >
            <Icon icon="simple-icons:pypi" class="h-[2rem] w-[2rem] mr-2" />
            View Neptun on PyPI
          </a>
        </div>

        <div class="flex items-center">
          <div class="flex-1 p-2 mr-2 font-mono text-sm rounded bg-muted">
            {{ pipInstallCommand }}
          </div>
          <ShadcnButton size="icon" variant="ghost">
            <CopyToClipboard :text="pipInstallCommand" />
          </ShadcnButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
