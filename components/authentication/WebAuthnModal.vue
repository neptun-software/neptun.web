<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  mode: 'login' | 'signup'
}

const props = defineProps<Props>()
const show = ref(false)
const userName = ref('')
const { $toast } = useNuxtApp()

const { user, fetch } = useUserSession()
const { register, authenticate, isSupported } = useWebAuthn({
  registerEndpoint: '/api/auth/webauthn/register',
  authenticateEndpoint: '/api/auth/webauthn/authenticate',
})

const isAuthenticating = ref(false)

async function signUp() {
  if (!userName.value) {
    return
  }

  try {
    isAuthenticating.value = true
    await register({
      userName: userName.value,
    })
    await fetch()
    show.value = false
    await navigateTo('/dashboard', {
      redirectCode: 303,
    })
  } catch (err: any) {
    console.log(err)
    $toast.error(err.data?.message || err.message)
  } finally {
    isAuthenticating.value = false
  }
}

async function signIn() {
  try {
    isAuthenticating.value = true
    await authenticate(userName.value)
    await fetch()
    show.value = false
    await navigateTo('/dashboard', {
      redirectCode: 303,
    })
  } catch (err: any) {
    console.log(err)
    $toast.error(err.data?.message || err.message)
  } finally {
    isAuthenticating.value = false
  }
}

const buttonText = computed(() => props.mode === 'login' ? 'Login with Passkey' : 'Register Passkey')
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
          {{ buttonText }}
        </ShadcnButton>
      </ShadcnDialogTrigger>

      <ShadcnDialogContent class="sm:max-w-md">
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>Passkey Authentication</ShadcnDialogTitle>
          <ShadcnDialogDescription>
            {{ props.mode === 'login' ? 'Login using your passkey' : 'Register a new passkey for password-less login' }}
          </ShadcnDialogDescription>
        </ShadcnDialogHeader>

        <div class="py-4">
          <form
            v-if="props.mode === 'signup'"
            class="space-y-4"
            @submit.prevent
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
                :disabled="isAuthenticating"
              />
            </div>

            <AsyncButton
              :on-click-async="signUp"
              :is-disabled="!userName"
              class="w-full"
            >
              Register New Passkey
            </AsyncButton>
          </form>

          <form
            v-else
            class="space-y-4"
            @submit.prevent
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
                :disabled="isAuthenticating"
              />
            </div>

            <AsyncButton
              :on-click-async="signIn"
              :is-disabled="!userName"
              class="w-full"
            >
              Authenticate with Passkey
            </AsyncButton>
          </form>
        </div>

        <ShadcnDialogFooter class="block mx-auto">
          <p class="flex text-xs text-muted-foreground">
            <Icon icon="lucide:info" class="mr-1 w-4 h-4" /> Passkeys are more secure than passwords and easier to use
          </p>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  </div>
</template>

<style scoped>
</style>
