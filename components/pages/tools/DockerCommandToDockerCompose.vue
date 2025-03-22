<script setup lang="ts">
import CopyToClipboard from '@/components/utilities/CopyToClipboard.vue'
import MarkdownRenderer from '@/components/utilities/MarkdownRenderer.client.vue'
import { withDefaultOnError } from '@/utils/defaults'
import { downloadAsFile } from '@/utils/files'
import { composerize, MessageType } from 'composerize-ts'
import { Download } from 'lucide-vue-next'

const dockerRun = ref(
  'docker run -it \
  --network=bridge \
  --publish=8080:80 \
  --cap-add=NET_ADMIN \
  --volume=/tmp/host:/container/path \
  --env MY_VAR=value \
  --name=mycontainer \
  --hostname=myhostname \
  --dns=8.8.8.8 \
  --entrypoint=/bin/bash \
  --workdir=/app \
  --user=1000:1000 \
  --group-add=group1 \
  --restart=always \
  --health-cmd="echo healthy" \
  --log-driver=json-file \
  --tmpfs=/tmp \
  --device=/dev/sda:/dev/sda \
  --sysctl net.ipv4.ip_forward=1 \
  --label com.example.foo=bar \
  --read-only \
  --stop-signal=SIGTERM \
  --ulimit nofile=1024:1024 \
  --security-opt label=level:s0 \
  ubuntu',
)

const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(dockerRun.value.trim()), { yaml: '', messages: [] }),
)
const dockerCompose = computed(() => conversionResult.value.yaml)
const notImplemented = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notImplemented).map(msg => msg.value),
)
const notComposable = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notTranslatable).map(msg => msg.value),
)
const errors = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.errorDuringConversion)
    .map(msg => msg.value),
)

async function download() {
  await downloadAsFile(dockerCompose.value, 'docker-compose', 'text/yaml', 'yml')
}
</script>

<template>
  <div>
    <ShadcnCard class="shadow-none">
      <ShadcnCardHeader>
        <ShadcnCardTitle>Docker Command to Docker Compose Converter</ShadcnCardTitle>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <ShadcnLabel for="docker-command">
          Your docker run command:
        </ShadcnLabel>
        <ShadcnTextarea
          id="docker-command" v-model="dockerRun" class="mt-2 font-mono"
          placeholder="Your docker run command to convert..." rows="3"
        />

        <ShadcnScrollArea class="mt-4 w-full rounded-md">
          <div class="w-full" style="max-height: 40vh;">
            <div class="p-4 rounded-md bg-muted">
              <MarkdownRenderer :content="`\`\`\`yaml\n${dockerCompose}\n\`\`\``" />

              <div class="absolute top-2 right-2">
                <AsyncButton
                  size="icon" variant="ghost" :hide-loader="true"
                  :is-disabled="dockerCompose === ''" :on-click-async="download"
                >
                  <Download class="size-6" />
                </AsyncButton>

                <ShadcnButton size="icon" variant="ghost" :disabled="dockerCompose === ''">
                  <CopyToClipboard :text="dockerCompose" />
                </ShadcnButton>
              </div>
            </div>
          </div>
          <ShadcnScrollBar orientation="vertical" />
          <ShadcnScrollBar orientation="horizontal" />
        </ShadcnScrollArea>

        <div v-if="notComposable.length > 0 || notImplemented.length > 0 || errors.length > 0" class="mt-4">
          <InfoBlock v-if="notComposable.length > 0" :is-visible="true" variant="error">
            These options are not translatable to docker-compose!
            <ul class="flex list-none">
              <li v-for="(message, index) of notComposable" :key="index">
                {{ message }}<span v-if="index < notComposable.length - 1">, </span>
              </li>
            </ul>
          </InfoBlock>

          <InfoBlock v-if="notImplemented.length > 0" :is-visible="true" variant="warning">
            These options are not yet implemented!
            <ul class="flex list-none">
              <li v-for="(message, index) of notImplemented" :key="index">
                {{ message }}<span v-if="index < notImplemented.length - 1">, </span>
              </li>
            </ul>
          </InfoBlock>

          <InfoBlock v-if="errors.length > 0" :is-visible="true" variant="error">
            The following errors occurred!
            <ul class="flex list-none">
              <li v-for="(message, index) of errors" :key="index">
                {{ message }}<span v-if="index < errors.length - 1">, </span>
              </li>
            </ul>
          </InfoBlock>
        </div>
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped>
</style>
