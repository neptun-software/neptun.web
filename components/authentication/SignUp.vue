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

async function signUp() {
  const { error } = await auth.signUp(email.value, password.value)

  if (error) {
    console.info('error:', error.message, error.data)
    const signUpError = error as ApiValidationError
    emailErrors.value = signUpError?.data?.data?.issues
      ?.filter((issue: ZodIssue) => issue.path[0] === 'email')
      .map((issue: ZodIssue) => issue.message) || []
    passwordErrors.value = signUpError?.data?.data?.issues
      ?.filter((issue: ZodIssue) => issue.path[0] === 'password')
      .map((issue: ZodIssue) => issue.message) || []

    $toast.error(signUpError.message)
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
    <ShadcnCard class="mx-2 max-w-full">
      <ShadcnCardHeader>
        <ShadcnCardTitle class="text-xl">
          Sign Up
        </ShadcnCardTitle>
        <ShadcnCardDescription>
          Enter your information to create an account
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
                <ShadcnLabel for="password">
                  Password
                </ShadcnLabel>
                <PasswordInput v-model="password" :on-enter="signUp" />
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
              <AsyncButton class="flex-1" :on-click-async="signUp">
                Create with Password
              </AsyncButton>
              <WebAuthnModal />
            </div>

            <ShadcnSeparator label="or Oauth" class="my-2" />

            <div class="flex flex-col gap-1">
              <ShadcnButton variant="outline" class="w-full" as-child>
                <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                <a href="/auth/google">
                  Sign in/up with Google
                  <Icon
                    icon="devicon:google"
                    class="h-[1.2rem] w-[1.2rem] ml-2"
                  />
                </a>
              </ShadcnButton>
              <ShadcnButton variant="outline" class="w-full" as-child>
                <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
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
            Already have an account?
            <NuxtLink to="/login" class="underline">
              Log In
            </NuxtLink>
          </div>
        </form>
      </ShadcnCardContent>
    </ShadcnCard>
  </div>
</template>

<style scoped></style>
