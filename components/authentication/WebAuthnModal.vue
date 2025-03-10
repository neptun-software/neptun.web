<script setup lang="ts">
import { Icon } from '@iconify/vue'

const show = ref(false)
const logging = ref(false)
const userName = ref('')
const { $toast } = useNuxtApp()

const { user, fetch } = useUserSession()
const { register, authenticate, isSupported } = useWebAuthn({
  registerEndpoint: '/api/auth/webauthn/register',
  authenticateEndpoint: '/api/auth/webauthn/authenticate',
})

async function signUp() {
  if (logging.value || !userName.value) {
    return
  }
  logging.value = true
  await register({
    userName: userName.value,
  })
    .then(() => {
      fetch()
      show.value = false
    })
    .catch((err) => {
      console.log(err)
      $toast.error(err.data?.message || err.message)
    })
  logging.value = false
}

async function signIn() {
  if (logging.value) {
    return
  }
  logging.value = true
  await authenticate(userName.value)
    .then(() => {
      fetch()
      show.value = false
    })
    .catch((err) => {
      console.log(err)
      $toast.error(err.data?.message || err.message)
    })
  logging.value = false
}
</script>

<template>
  <div>
    <ShadcnDialog v-model="show">
      <ShadcnDialogTrigger as-child>
        <ShadcnButton
          v-if="!user?.webauthn && isSupported"
          variant="outline"
          type="button"
        >
          <Icon icon="lucide:key" class="mr-2 w-4 h-4" />
          Passkeys
        </ShadcnButton>
      </ShadcnDialogTrigger>

      <ShadcnDialogContent class="sm:max-w-md">
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>Passkey Authentication</ShadcnDialogTitle>
          <ShadcnDialogDescription>
            Use biometrics or security keys to login without passwords
          </ShadcnDialogDescription>
        </ShadcnDialogHeader>

        <div class="py-4 space-y-6">
          <form
            class="space-y-4"
            @submit.prevent="signUp"
          >
            <div class="space-y-2">
              <ShadcnLabel for="email-register">
                Email
              </ShadcnLabel>
              <ShadcnInput
                id="email-register"
                v-model="userName"
                type="email"
                placeholder="your.name@domain.tld"
                required
              />
            </div>

            <AsyncButton
              type="submit"
              :loading="logging"
              :disabled="!userName"
              class="w-full"
            >
              Register New Passkey
            </AsyncButton>
          </form>

          <ShadcnSeparator>
            <span class="px-2 text-xs text-muted-foreground">OR</span>
          </ShadcnSeparator>

          <form
            class="space-y-4"
            @submit.prevent="signIn"
          >
            <div class="space-y-2">
              <ShadcnLabel for="email-login">
                Email
              </ShadcnLabel>
              <ShadcnInput
                id="email-login"
                v-model="userName"
                type="email"
                placeholder="your.name@domain.tld"
                autocomplete="username webauthn"
                required
              />
            </div>

            <AsyncButton
              type="submit"
              :loading="logging"
              class="w-full"
            >
              Authenticate with Passkey
            </AsyncButton>
          </form>
        </div>

        <ShadcnDialogFooter>
          <p class="text-xs text-muted-foreground">
            Passkeys are more secure than passwords and easier to use
          </p>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  </div>
</template>

<style scoped></style>
