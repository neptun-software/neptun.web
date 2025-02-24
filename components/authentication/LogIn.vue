<script setup lang="ts">
import type { ZodIssue } from 'zod'
import type { ApiValidationError } from '~/lib/types/api'
import { Icon } from '@iconify/vue'
import {
  validateEmailInput,
  validatePasswordInput,
} from '~/lib/validation/user'

const { $toast } = useNuxtApp()

const { console } = useLogger()

const auth = useAuth()
const { fetch } = useUserSession()
const email = ref('')
const password = ref('')
const emailErrors = ref<string[]>([])
const passwordErrors = ref<string[]>([])

watch(email, (newEmail) => {
  emailErrors.value = validateEmailInput(newEmail)
})

watch(password, (newPassword) => {
  passwordErrors.value = validatePasswordInput(newPassword)
})

async function signIn() {
  const { error } = await auth.signIn(email.value, password.value)

  if (error) {
    console.info('error:', error.message, error.data)
    const loginError = error as ApiValidationError
    emailErrors.value = loginError?.data?.data?.issues
      ?.filter((issue: ZodIssue) => issue.path[0] === 'email')
      .map((issue: ZodIssue) => issue.message) || []
    passwordErrors.value = loginError?.data?.data?.issues
      ?.filter((issue: ZodIssue) => issue.path[0] === 'password')
      .map((issue: ZodIssue) => issue.message) || []

    $toast.error(loginError.message)
    return
  }

  await fetch() // reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
  navigateTo('/dashboard', {
    redirectCode: 303,
  })
}
</script>

<template>
  <div>
    <ShadcnCard class="mx-2 max-full">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-2xl">
          Log In
        </ShadcnCardTitle>
        <ShadcnCardDescription>
          Enter your email below to login to your account
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
                  @keydown.enter="signIn()"
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
                    to="/new-password"
                    class="inline-block ml-auto text-sm underline"
                  >
                    Forgot your password?
                  </NuxtLink>
                </div>
                <PasswordInput v-model="password" :on-enter="signIn" />
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

            <AsyncButton class="w-full" :on-click-async="signIn">
              Login to your account
            </AsyncButton>

            <ShadcnSeparator label="or Oauth" class="my-2" />
            <div class="flex flex-col gap-1">
              <ShadcnButton variant="outline" class="w-full" as-child>
                <a href="/auth/google">
                  <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                  Sign in/up with Google
                  <Icon
                    icon="devicon:google"
                    class="h-[1.2rem] w-[1.2rem] ml-2"
                  />
                </a>
              </ShadcnButton>
              <ShadcnButton variant="outline" class="w-full" as-child>
                <a href="/auth/github">
                  <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
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
            Don't have an account?
            <NuxtLink to="/sign-up" class="underline">
              Sign Up
            </NuxtLink>
          </div>
        </form>
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped></style>
