<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  name: 'Account',
  alias: accountAliases,
  middleware: ['protected'],
})

const { updateUser, deleteUser } = useUser()
const { session, clear, fetch } = useUserSession()

const updatedUser = ref<{
  email: string
  password: string
  confirmPassword: string
}>({
  email: session?.value.user?.primary_email ?? '',
  password: '',
  confirmPassword: '',
})

const emailIsNew = computed(() => {
  if (!session.value.user || !session.value.user?.primary_email) {
    return false
  }
  return session.value.user?.primary_email !== updatedUser.value?.email
})

async function updateAccount() {
  if (!session.value.user || !session.value.user?.id) {
    return
  }
  const update = await updateUser(session.value.user?.id, {
    ...updatedUser.value,
  }).then(async (data) => {
    await fetch()
    return data
  })

  if (update.error) {
    toast.error(String(update.error))
  }
}

async function deleteAccount() {
  if (!session.value.user || !session.value.user?.id) {
    return
  }
  await deleteUser(session.value.user?.id).then(() => {
    clear().then(() => {
      navigateTo('/home')
    })
  })
}

async function signOut() {
  await clear().then(() => {
    navigateTo('/home')
  })
}
</script>

<template>
  <div class="mx-8 max-w-[calc(100vw-4rem-30px)] overflow-hidden">
    <h1 class="text-3xl font-bold">
      Account
    </h1>
    <ShadcnSeparator class="my-2 h-1" />
    <AuthState>
      <template #default="{ loggedIn }">
        <div class="flex flex-wrap gap-2 lg:gap-8">
          <div>
            <ShadcnLabel for="email">
              Email
            </ShadcnLabel>
            <div class="flex gap-2">
              <ShadcnInput
                id="email"
                v-model="updatedUser.email"
                type="email"
                name="email"
                class="w-full"
                :placeholder="session?.user?.primary_email"
                required
              />

              <AsyncButton
                v-if="loggedIn"
                :is-disabled="!emailIsNew || updatedUser.email?.trim() === ''"
                :on-click-async="updateAccount"
              >
                Update
              </AsyncButton>
            </div>
          </div>
          <div>
            <ShadcnLabel for="password">
              Password
            </ShadcnLabel>
            <div class="flex gap-2">
              <!-- &bull; -->
              <ShadcnInput
                id="password"
                v-model="updatedUser.password"
                type="password"
                name="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />
              <ShadcnInput
                id="password"
                v-model="updatedUser.confirmPassword"
                type="password"
                name="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />

              <AsyncButton
                v-if="loggedIn"
                :is-disabled="
                  updatedUser.password?.trim() === ''
                    || updatedUser.confirmPassword?.trim() === ''
                    || updatedUser.password !== updatedUser.confirmPassword
                "
                :on-click-async="updateAccount"
              >
                Update
              </AsyncButton>
            </div>
          </div>
        </div>
        <!-- <DevOnly>
          <ShadcnSeparator class="my-2 h-1" />
          <b>Debug:</b> {{ session }}
        </DevOnly> -->
        <ShadcnSeparator class="my-2 h-1" />

        <AsyncButton v-if="loggedIn" class="mr-1" :on-click-async="signOut">
          Logout
        </AsyncButton>

        <ShadcnAlertDialog v-if="loggedIn">
          <ShadcnAlertDialogTrigger as-child>
            <ShadcnButton variant="destructive">
              Delete
            </ShadcnButton>
          </ShadcnAlertDialogTrigger>
          <ShadcnAlertDialogContent>
            <ShadcnAlertDialogHeader>
              <ShadcnAlertDialogTitle>
                Are you absolutely sure?
              </ShadcnAlertDialogTitle>
              <ShadcnAlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </ShadcnAlertDialogDescription>
            </ShadcnAlertDialogHeader>
            <ShadcnAlertDialogFooter>
              <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
              <ShadcnAlertDialogAction as-child>
                <AsyncButton
                  variant="destructive"
                  :on-click-async="deleteAccount"
                >
                  Delete
                </AsyncButton>
              </ShadcnAlertDialogAction>
            </ShadcnAlertDialogFooter>
          </ShadcnAlertDialogContent>
        </ShadcnAlertDialog>
      </template>
      <template #placeholder>
        <ShadcnButton disabled>
          <Loader2 class="mr-2 w-4 h-4 animate-spin" />
          Loading Account Data!
        </ShadcnButton>
      </template>
    </AuthState>

    <ShadcnSeparator class="my-2 h-1" />

    <AccountSection>
      <template #header>
        CLI Configuration
      </template>
      <template #content>
        <CLI />
      </template>
    </AccountSection>

    <AccountSection>
      <template #header>
        Neptun (Github) App Installations
      </template>
      <template #content>
        <Installations />
      </template>
    </AccountSection>
  </div>
</template>

<style scoped></style>
