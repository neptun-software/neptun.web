<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { updateUser, deleteUser } = useUser();
const { session, clear, fetch } = useUserSession();

const emailIsNew = computed(() => {
  if (!session.value.user || !session.value.user?.primary_email) return false;
  return session.value.user?.primary_email !== updatedUser.value?.email;
});
const updatedUser = ref<{
  email: string;
  password: string;
  confirmPassword: string;
}>({
  email: session?.value.user?.primary_email ?? '',
  password: '',
  confirmPassword: '',
});
const updateAccount = async () => {
  if (!session.value.user || !session.value.user?.id) return;
  const update = await updateUser(session.value.user?.id, {
    ...updatedUser.value,
  }).then(async (data) => {
    await fetch();
    return data;
  });

  if (update.error) {
    toast.error(String(update.error));
  }
};

const deleteAccount = async () => {
  if (!session.value.user || !session.value.user?.id) return;
  await deleteUser(session.value.user?.id).then(() => {
    clear().then(() => {
      navigateTo('/home');
    });
  });
};

const signOut = () => {
  clear().then(() => {
    navigateTo('/home');
  });
};

definePageMeta({
  name: 'Account',
  middleware: ['protected'],
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Account</h1>
    <ShadcnSeparator class="h-1 my-2" />
    <AuthState>
      <template #default="{ loggedIn }">
        <div class="flex flex-wrap gap-8">
          <div>
            <ShadcnLabel for="email">Email</ShadcnLabel>
            <div class="flex gap-2">
              <ShadcnInput
                id="email"
                type="email"
                name="email"
                class="w-full"
                v-model="updatedUser.email"
                :placeholder="session?.user?.primary_email"
                required
              />
              <ShadcnButton
                type="button"
                v-if="loggedIn"
                @click="updateAccount"
                :disabled="!emailIsNew || updatedUser.email?.trim() === ''"
              >
                Update
              </ShadcnButton>
            </div>
          </div>
          <div>
            <ShadcnLabel for="password">Password</ShadcnLabel>
            <div class="flex gap-2">
              <!-- &bull; -->
              <ShadcnInput
                id="password"
                type="password"
                name="password"
                v-model="updatedUser.password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />
              <ShadcnInput
                id="password"
                type="password"
                name="password"
                v-model="updatedUser.confirmPassword"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />
              <ShadcnButton
                type="button"
                v-if="loggedIn"
                @click="updateAccount"
                :disabled="
                  updatedUser.password?.trim() === '' ||
                  updatedUser.confirmPassword?.trim() === '' ||
                  updatedUser.password !== updatedUser.confirmPassword
                "
              >
                Update
              </ShadcnButton>
            </div>
          </div>
        </div>
        <ShadcnSeparator class="h-1 my-2" />
        <CLI />
        <DevOnly>
          <ShadcnSeparator class="h-1 my-2" />
          <b>Debug:</b> {{ session }}
        </DevOnly>
        <ShadcnSeparator class="h-1 my-2" />
        <ShadcnButton
          class="mr-1"
          type="button"
          v-if="loggedIn"
          @click="signOut"
        >
          Logout
        </ShadcnButton>
        <ShadcnAlertDialog v-if="loggedIn">
          <ShadcnAlertDialogTrigger as-child>
            <ShadcnButton type="button" variant="destructive">
              Delete
            </ShadcnButton>
          </ShadcnAlertDialogTrigger>
          <ShadcnAlertDialogContent>
            <ShadcnAlertDialogHeader>
              <ShadcnAlertDialogTitle
                >Are you absolutely sure?</ShadcnAlertDialogTitle
              >
              <ShadcnAlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </ShadcnAlertDialogDescription>
            </ShadcnAlertDialogHeader>
            <ShadcnAlertDialogFooter>
              <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
              <ShadcnAlertDialogAction as-child>
                <ShadcnButton
                  type="button"
                  variant="destructive"
                  @click="deleteAccount"
                >
                  Delete
                </ShadcnButton>
              </ShadcnAlertDialogAction>
            </ShadcnAlertDialogFooter>
          </ShadcnAlertDialogContent>
        </ShadcnAlertDialog>
      </template>
      <template #placeholder>
        <ShadcnButton disabled>
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Loading Account Data...
        </ShadcnButton>
      </template>
    </AuthState>
  </div>
</template>

<style scoped></style>
