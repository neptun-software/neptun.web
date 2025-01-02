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
  <div class="container px-4 pt-4 mx-auto max-w-7xl">
    <h1 class="text-2xl font-bold md:text-3xl">
      Account
    </h1>
    <ShadcnSeparator class="h-1 my-2 md:my-4" />
    <AuthState>
      <template #default="{ loggedIn }">
        <div class="flex flex-col gap-4 md:flex-row md:gap-8">
          <div class="w-full md:w-auto">
            <ShadcnLabel for="email" class="text-sm md:text-base">
              Email
            </ShadcnLabel>
            <div class="flex flex-col gap-2 md:flex-row">
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
                class="w-full md:w-auto"
              >
                Update
              </AsyncButton>
            </div>
          </div>
          <div class="w-full md:w-auto">
            <ShadcnLabel for="password" class="text-sm md:text-base">
              Password
            </ShadcnLabel>
            <div class="flex flex-col gap-2 md:flex-row">
              <div class="flex flex-col w-full gap-2 md:flex-row">
                <ShadcnInput
                  id="password"
                  v-model="updatedUser.password"
                  type="password"
                  name="password"
                  placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                  required
                  class="w-full"
                />
                <ShadcnInput
                  id="confirmPassword"
                  v-model="updatedUser.confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                  required
                  class="w-full"
                />
              </div>
              <AsyncButton
                v-if="loggedIn"
                :is-disabled="
                  updatedUser.password?.trim() === ''
                    || updatedUser.confirmPassword?.trim() === ''
                    || updatedUser.password !== updatedUser.confirmPassword
                "
                :on-click-async="updateAccount"
                class="w-full md:w-auto whitespace-nowrap"
              >
                Update
              </AsyncButton>
            </div>
          </div>
        </div>
        <ShadcnSeparator class="h-1 my-2" />

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
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Loading Account Data!
        </ShadcnButton>
      </template>
    </AuthState>

    <ShadcnSeparator class="h-1 my-2" />

    <AccountSection>
      <template #header>
        CLI Configuration
      </template>
      <template #content>
        <CLI />
      </template>
    </AccountSection>

    <AccountSection :is-last="true">
      <template #header>
        Neptun (GitHub) App Installations
      </template>
      <template #content>
        <Installations />
      </template>
    </AccountSection>
  </div>
</template>

<style scoped></style>
