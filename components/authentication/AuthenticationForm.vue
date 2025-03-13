<script setup lang="ts">
import type { ZodIssue } from 'zod'
import type { ApiValidationError } from '~/lib/types/api'
import { Icon } from '@iconify/vue'
import {
  validateEmailInput,
  validatePasswordInput,
} from '~/lib/validation/user'

interface Props {
  mode: 'login' | 'signup'
}

const props = defineProps<Props>()

const { $toast } = useNuxtApp()
const { console } = useLogger()
const auth = useAuth()
const { fetch } = useUserSession()

const email = ref('')
const password = ref('')
const emailErrors = ref<string[]>([])
const passwordErrors = ref<string[]>([])
const isAuthenticating = ref(false)

watch(email, (newEmail) => {
  emailErrors.value = validateEmailInput(newEmail)
})

watch(password, (newPassword) => {
  passwordErrors.value = validatePasswordInput(newPassword)
})

async function handleSubmit() {
  try {
    isAuthenticating.value = true
    const authAction = props.mode === 'login' ? auth.signIn : auth.signUp
    const { error } = await authAction(email.value, password.value)

    if (error) {
      console.info('error:', error.message, error.data)
      const authError = error as ApiValidationError
      emailErrors.value = authError?.data?.data?.issues
        ?.filter((issue: ZodIssue) => issue.path[0] === 'email')
        .map((issue: ZodIssue) => issue.message) || []
      passwordErrors.value = authError?.data?.data?.issues
        ?.filter((issue: ZodIssue) => issue.path[0] === 'password')
        .map((issue: ZodIssue) => issue.message) || []

      $toast.error(authError.message)
      return
    }

    await fetch() // reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
    await navigateTo('/dashboard', {
      redirectCode: 303,
    })
  } finally {
    isAuthenticating.value = false
  }
}

const formTitle = computed(() => props.mode === 'login' ? 'Log In' : 'Sign Up')
const formDescription = computed(() =>
  props.mode === 'login'
    ? 'Enter your email below to login to your account'
    : 'Enter your information to create an account',
)
const submitButtonText = computed(() =>
  props.mode === 'login' ? 'Login with Password' : 'Create with Password',
)
const alternateActionText = computed(() =>
  props.mode === 'login'
    ? 'Don\'t have an account?'
    : 'Already have an account?',
)
const alternateActionLink = computed(() =>
  props.mode === 'login' ? '/sign-up' : '/login',
)
const alternateActionLabel = computed(() =>
  props.mode === 'login' ? 'Sign Up' : 'Log In',
)
</script>

<template>
  <div>
    <ShadcnCard class="mx-2 max-w-full">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-2xl">
          {{ formTitle }}
        </ShadcnCardTitle>
        <ShadcnCardDescription>
          {{ formDescription }}
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <form @submit.prevent>
          <div class="grid gap-4">
            <div>
              <div class="grid gap-2 mb-1">
                <ShadcnLabel for="email">
                  Email
                </ShadcnLabel>
                <ShadcnInput
                  id="email"
                  v-model="email"
                  type="email"
                  name="email"
                  placeholder="your.name@domain.tld"
                  required
                  autocomplete="email"
                  :disabled="isAuthenticating"
                  @keydown.enter="handleSubmit()"
                />
              </div>

              <ul v-if="emailErrors?.length > 0" class="pl-5 list-disc">
                <li
                  v-for="(error, index) in emailErrors"
                  :key="index"
                  class="text-sm font-bold text-destructive"
                >
                  {{ error }}<br>
                </li>
              </ul>
            </div>
            <div>
              <div class="grid gap-2 mb-1">
                <div class="flex items-center">
                  <ShadcnLabel for="password">
                    Password
                  </ShadcnLabel>
                  <NuxtLink
                    v-if="mode === 'login'"
                    to="/new-password"
                    class="inline-block ml-auto text-sm underline"
                  >
                    Forgot your password?
                  </NuxtLink>
                </div>
                <PasswordInput
                  v-model="password"
                  :on-enter="handleSubmit"
                  :disabled="isAuthenticating"
                />
              </div>

              <ul v-if="passwordErrors?.length > 0" class="pl-5 list-disc">
                <li
                  v-for="(error, index) in passwordErrors"
                  :key="index"
                  class="text-sm font-bold text-destructive"
                >
                  {{ error }}<br>
                </li>
              </ul>
            </div>

            <div class="flex gap-2">
              <AsyncButton
                class="flex-1"
                :on-click-async="handleSubmit"
                :is-disabled="!email || !password || isAuthenticating"
              >
                {{ submitButtonText }}
              </AsyncButton>
              <WebAuthnModal :mode="mode" />
            </div>

            <ShadcnSeparator label="or Oauth" class="my-2" />

            <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
            <div class="flex flex-col gap-1">
              <ShadcnButton
                variant="outline"
                class="w-full"
                as-child
                :disabled="isAuthenticating"
              >
                <a href="/auth/google">
                  Sign in/up with Google
                  <Icon
                    icon="devicon:google"
                    class="h-[1.2rem] w-[1.2rem] ml-2"
                  />
                </a>
              </ShadcnButton>
              <ShadcnButton
                variant="outline"
                class="w-full"
                as-child
                :disabled="isAuthenticating"
              >
                <a href="/auth/github">
                  Sign in/up with GitHub
                  <Icon
                    icon="ant-design:github-filled"
                    class="h-[1.4rem] w-[1.4rem] ml-2"
                  />
                </a>
              </ShadcnButton>
            </div>
            <ShadcnSeparator />
          </div>
          <div class="mt-4 text-sm text-center">
            {{ alternateActionText }}
            <NuxtLink :to="alternateActionLink" class="underline">
              {{ alternateActionLabel }}
            </NuxtLink>
          </div>
        </form>
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped>
</style>
