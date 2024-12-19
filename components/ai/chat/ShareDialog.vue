<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Share } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const { selectedAiChatId, selectedAiChatIsPlayground } = useSelectedAiChat()
const { user } = useUserSession()
// const { console } = useLogger();

const formSchema = toTypedSchema(
  z.object({
    is_unprotected: z.boolean().default(true).optional(),
    password: z.string().max(128).optional(),
    email_whitelist: z.array(z.string().min(5).email()).max(10).optional(),
  }),
)

const {
  handleSubmit,
  values: formValues,
  setFieldError,
  setValues,
} = useForm({
  validationSchema: formSchema,
  initialValues: {
    is_unprotected: true,
    password: '',
    email_whitelist: [],
  },
})

async function validateTag(event: KeyboardEvent) {
  // await validateField('email_whitelist')
  const input = event.target as HTMLInputElement
  const email = input.value.trim()

  if (email && z.string().email().safeParse(email).success) {
    const updatedWhitelist = [...(formValues.email_whitelist || []), email]
    setValues({ email_whitelist: updatedWhitelist })
    input.value = ''
    setFieldError('email_whitelist', undefined)
  } else {
    setFieldError('email_whitelist', 'Invalid email address')
  }
}

const { data, status, error, refresh } = useFetch(
  `/api/users/${user.value?.id ?? -1}/chats/${selectedAiChatId.value}/shares`,
)

const isSubmitting = ref(false)
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  if (
    !formValues.is_unprotected
    && (!values.password || values.password?.length === 0)
    && (formValues.email_whitelist || []).length === 0
  ) {
    toast.error(
      'Please set a password or add at least one email to the whitelist.',
      {
        description:
          'Both fields cannot be empty when the chat is not unprotected.',
      },
    )

    setFieldError(
      'password',
      'Both fields cannot be empty when the chat is not unprotected. Please set a password or add at least one email to the whitelist.',
    )
    setFieldError(
      'email_whitelist',
      'Both fields cannot be empty when the chat is not unprotected. Please set a password or add at least one email to the whitelist.',
    )

    isSubmitting.value = false

    return
  }

  /* toast('You submitted the following values:', {
    description: h(
      'pre',
      {
        class:
          'mt-2 w-fit max-w-full overflow-x-auto rounded-md bg-slate-950 p-2',
      },
      h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))
    ),
  }); */

  const shareCreated = await $fetch(
    `/api/users/${user.value?.id}/chats/${selectedAiChatId.value}/shares`,
    {
      method: 'POST',
      body: {
        is_shared: true,
        is_protected: !values.is_unprotected,
        hashed_password: values.password,
      },
    },
  )
    .then((data) => {
      if (data && data.share) {
        toast.success('Share created!')
      } else {
        toast.error('Failed to create share!')
      }

      return data
    })
    .catch(() => {
      toast.error('Failed to create share!')
    })

  if (
    shareCreated
    && values.email_whitelist
    && values.email_whitelist.length > 0
  ) {
    await $fetch(
      `/api/users/${user.value?.id}/chats/${selectedAiChatId.value}/shares/${shareCreated.share?.id}/whitelist-entries`,
      {
        method: 'POST',
        body: values.email_whitelist,
      },
    )
      .then((data) => {
        if (data && data.shareWhitelistEntries) {
          toast.success('Whitelist entries created!')
        } else {
          toast.error('Failed to create whitelist entries!')
        }

        return data
      })
      .catch(() => {
        toast.error('Failed to create whitelist entries!')
      })
  }

  refresh()

  isSubmitting.value = false
})

const requestUrl = useRequestURL()
const url = computed(() => {
  return `http${IS_DEV ? '' : 's'}://${requestUrl.host}/shared/chats/${
    data.value
  }`
})
</script>

<template>
  <div>
    <ClientOnly>
      <ShadcnDialog>
        <ShadcnDialogTrigger as-child>
          <ShadcnButton
            size="icon"
            variant="ghost"
            :disabled="selectedAiChatIsPlayground"
          >
            <Share class="size-6" />
          </ShadcnButton>
        </ShadcnDialogTrigger>
        <ShadcnDialogContent>
          <ShadcnDialogHeader>
            <ShadcnDialogTitle>
              Share your chat with friends or colleagues
            </ShadcnDialogTitle>
            <ShadcnDialogDescription>
              You can make it public, for everybody who has the link, you could
              also make it password protected and you could whitelist other
              users.<br>
              Others can not edit your chat or send messages, they are just
              viewers.
            </ShadcnDialogDescription>
          </ShadcnDialogHeader>

          <form
            v-if="status === 'success' && !data"
            class="space-y-6"
            @submit="onSubmit"
          >
            <ShadcnFormField
              v-slot="{ value, handleChange }"
              type="checkbox"
              name="is_unprotected"
            >
              <ShadcnFormItem
                class="flex flex-row gap-x-3 items-start p-4 space-y-0 rounded-md border"
              >
                <ShadcnFormControl>
                  <ShadcnCheckbox
                    :checked="value"
                    @update:checked="handleChange"
                  />
                </ShadcnFormControl>
                <div class="space-y-1 leading-none">
                  <ShadcnFormLabel>
                    Every chat you publish is public by default, if you do not
                    disable this flag.
                  </ShadcnFormLabel>
                  <ShadcnFormDescription>
                    If you uncheck this checkbox, you can define a password
                    and/or a whitelist.
                  </ShadcnFormDescription>
                  <ShadcnFormMessage />
                </div>
              </ShadcnFormItem>
            </ShadcnFormField>

            <template v-if="!formValues.is_unprotected">
              <ShadcnSeparator />

              <ShadcnFormField v-slot="{ value, handleChange }" name="password">
                <ShadcnFormItem>
                  <ShadcnFormLabel>Password</ShadcnFormLabel>
                  <ShadcnFormControl>
                    <div class="relative">
                      <PasswordInput
                        :model-value="value"
                        :on-enter="onSubmit"
                        @update:model-value="handleChange"
                      />
                    </div>
                  </ShadcnFormControl>
                  <ShadcnFormDescription>
                    Secure your chat with a password.
                  </ShadcnFormDescription>
                  <ShadcnFormMessage />
                </ShadcnFormItem>
              </ShadcnFormField>

              <ShadcnFormField v-slot="{ value }" name="email_whitelist">
                <ShadcnFormItem>
                  <ShadcnFormLabel>
                    Emails you want to whitelist
                  </ShadcnFormLabel>
                  <ShadcnFormControl>
                    <ShadcnTagsInput :model-value="value">
                      <ShadcnTagsInputItem
                        v-for="item in value"
                        :key="item"
                        :value="item"
                      >
                        <ShadcnTagsInputItemText />
                        <ShadcnTagsInputItemDelete />
                      </ShadcnTagsInputItem>

                      <ShadcnTagsInputInput
                        placeholder="Whitelisted user emails..."
                        @keydown.enter.prevent="validateTag"
                      />
                    </ShadcnTagsInput>
                  </ShadcnFormControl>
                  <ShadcnFormDescription>
                    Add the emails you want to whitelist. You can add multiple.
                    Only primary emails! The emails are checked when you click
                    publish. You get no feedback, if the emails are actually
                    connected to a user, so that this feature can not be abused
                    for brute-forcing that easily. (You are automatically
                    whitelisted, of course.)
                  </ShadcnFormDescription>
                  <ShadcnFormMessage />
                </ShadcnFormItem>
              </ShadcnFormField>
            </template>

            <ShadcnDialogFooter class="flex gap-2">
              <ShadcnButton type="submit" :disabled="isSubmitting">
                Publish with the configured settings
              </ShadcnButton>
              <ShadcnDialogClose as-child>
                <ShadcnButton variant="secondary">
                  Close
                </ShadcnButton>
              </ShadcnDialogClose>
            </ShadcnDialogFooter>
          </form>
          <div v-else>
            You have already published this chat!<br>
            <div class="flex gap-2 items-center px-2 py-1 rounded-sm border">
              {{ url }}
              <CopyToClipboard :text="url" />
            </div>
          </div>
          <div
            v-if="error"
            class="flex gap-2 justify-between items-center py-1 pr-1 pl-2 rounded-sm border border-destructive"
          >
            Failed to check if chat is published.<br>

            <AsyncButton
              variant="secondary"
              :on-click-async="(_event: MouseEvent) => refresh()"
            >
              Retry
            </AsyncButton>
          </div>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
