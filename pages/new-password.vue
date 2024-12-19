<script setup lang="ts">
import { CheckIcon, CircleIcon, DotIcon } from '@radix-icons/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { emailSchema, passwordSchema } from '~/lib/types/input.validation'

// defineOgImageComponent('NuxtSeo');

definePageMeta({
  name: 'New Password',
  alias: ['/forgot-password', '/reset-password'],
})

async function validateOtpAndResetPassword(email: string, otp: string[], newPassword: string) {
  try {
    const response = await $fetch('/auth/otp', {
      method: 'POST',
      body: {
        action: 'validate',
        email,
        otp: otp.join(''),
        new_password: newPassword,
      },
    })

    if (response.success) {
      return true
    }

    toast.error(response.message || 'Invalid OTP')

    return false
  } catch (error) {
    console.error('OTP validation error:', error)
    toast.error('OTP validation failed')
    return false
  }
}

const sendingOtpEmail = ref(false)
async function sendOtpEmail(email: string) {
  sendingOtpEmail.value = true

  try {
    const response = await $fetch('/auth/otp', {
      method: 'POST',
      body: { action: 'create', email },
    })

    if (response.success) {
      toast.success('OTP sent to your email')
      return true
    }

    toast.error(response.message || 'Failed to create OTP')
    return false
  } catch (error) {
    console.error('Error creating OTP:', error)
    toast.error('Failed to create OTP')
    return false
  }
}

const stepIndex = ref(1)
const steps = [
  {
    step: 1,
    title: 'Email',
    description: 'Enter your email address',
  },
  {
    step: 2,
    title: 'OTP',
    description: 'Enter your onetime password',
  },
  {
    step: 3,
    title: 'New Password',
    description: 'Enter your new password',
  },
]

const formSchemaArray = [
  z.object({
    email: emailSchema,
  }),
  z.object({
    otp: z
      .array(z.coerce.string())
      .length(5, { message: 'Has to be 5 digits. Invalid input!' }),
  }),
  z.object({
    password: passwordSchema,
  }),
]
const schemaForComponent = computed(() =>
  toTypedSchema(formSchemaArray[stepIndex.value - 1]),
)

const formSchema = z.object({
  email: emailSchema,
  otp: z
    .array(z.coerce.string())
    .length(5, { message: 'Has to be 5 digits. Invalid input!' }),
  password: passwordSchema,
})

const otp = ref(Array.from({ length: 5 }).fill(''))
const otpIsValid = ref(false)

const { isFieldDirty, handleSubmit, setFieldValue, validate, values, errors }
  = useForm({
    validationSchema: toTypedSchema(formSchema),
  })

const submittingNewPassword = ref(false)
const onSubmit = handleSubmit(async (values) => {
  submittingNewPassword.value = true

  /* toast('You submitted the following values:', {
    description: h(
      'pre',
      { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' },
      h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))
    ),
  }); */

  const successfullyValidated = await validateOtpAndResetPassword(
    values.email,
    values.otp,
    values.password,
  )

  if (successfullyValidated) {
    navigateTo('/log-in', {
      redirectCode: 303,
    })
  } else {
    toast.error('Failed to validate OTP.')
    submittingNewPassword.value = false
    sendingOtpEmail.value = false
  }
})

function handleComplete(e: string[]) {
  console.log('Completed OTP:', e.join(''))
  otpIsValid.value = true
}

function handleModelValueUpdate(arrStr: string[]) {
  arrStr.forEach((val, index) => {
    if (otp.value[index] !== val) {
      otp.value[index] = val
    }
  })

  console.log('Updated model value:', otp.value)
  setFieldValue('otp', [...otp.value])
  validate()

  if (otp.value.length === 5 && !otp.value.includes('')) {
    handleComplete(otp.value)
  }
}

const isCurrentStepValid = computed(() => {
  switch (stepIndex.value) {
    case 1:
      return values.email && !errors.value.email && !sendingOtpEmail.value
    case 2:
      return values.otp?.length === 5 && !errors.value.otp
    case 3:
      return (
        values.password
        && !errors.value.password
        && !submittingNewPassword.value
      )
    default:
      return false
  }
})

const canGoNext = computed(() => {
  if (stepIndex.value === 2 && !otpIsValid.value) {
    return false
  }
  return isCurrentStepValid.value
})
</script>

<template>
  <div class="p-4">
    <h1 class="pb-6 text-3xl font-bold text-center">
      New Password
    </h1>

    <ShadcnForm
      v-slot="{ meta }"
      keep-values
      class="flex flex-col items-center space-y-6"
      as=""
      :validation-schema="schemaForComponent"
    >
      <ShadcnStepper
        v-slot="{ isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
        class="block w-full"
      >
        <form @submit.prevent>
          <div class="flex w-full gap-2 flex-start">
            <ShadcnStepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex flex-col items-center justify-center w-full"
              :step="step.step"
            >
              <ShadcnStepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
              />

              <ShadcnStepperTrigger as-child>
                <ShadcnButton
                  :variant="
                    state === 'completed' || state === 'active'
                      ? 'default'
                      : 'outline'
                  "
                  size="icon"
                  class="z-10 rounded-full shrink-0"
                  :class="[
                    state === 'active'
                      && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
                  ]"
                  :disabled="state !== 'completed' && !meta.valid"
                >
                  <CheckIcon v-if="state === 'completed'" class="size-5" />
                  <CircleIcon v-if="state === 'active'" />
                  <DotIcon v-if="state === 'inactive'" />
                </ShadcnButton>
              </ShadcnStepperTrigger>

              <div class="flex flex-col items-center mt-5 text-center">
                <ShadcnStepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-semibold transition lg:text-base"
                >
                  {{ step.title }}
                </ShadcnStepperTitle>
                <ShadcnStepperDescription
                  :class="[state === 'active' && 'text-primary']"
                  class="text-xs transition sr-only text-muted-foreground md:not-sr-only lg:text-sm"
                >
                  {{ step.description }}
                </ShadcnStepperDescription>
              </div>
            </ShadcnStepperItem>
          </div>

          <div class="flex flex-col items-center w-full">
            <div>
              <div class="flex flex-col gap-4 mt-4">
                <template v-if="stepIndex === 1">
                  <ShadcnFormField
                    v-slot="{ componentField }"
                    name="email"
                    :validate-on-blur="!isFieldDirty"
                  >
                    <ShadcnFormItem class="w-fit">
                      <ShadcnFormLabel> Email </ShadcnFormLabel>
                      <ShadcnFormControl>
                        <ShadcnInput
                          type="email"
                          placeholder="your.name@domain.tld"
                          v-bind="componentField"
                          @update:model-value="
                            setFieldValue('email', $event as string)
                          "
                        />
                      </ShadcnFormControl>
                      <ShadcnFormDescription>
                        The email, where you forgot the password to.
                      </ShadcnFormDescription>
                      <ShadcnFormMessage />
                    </ShadcnFormItem>
                  </ShadcnFormField>
                </template>

                <template v-if="stepIndex === 2">
                  <ShadcnFormField
                    v-slot="{ componentField, value }"
                    name="otp"
                    :validate-on-blur="!isFieldDirty"
                  >
                    <ShadcnFormItem>
                      <ShadcnFormLabel>OTP</ShadcnFormLabel>
                      <ShadcnFormControl>
                        <div class="flex items-baseline gap-2">
                          <ShadcnPinInput
                            id="otp"
                            v-model="value!"
                            :name="componentField.name"
                            placeholder="○"
                            class="flex items-center gap-2 mt-1"
                            :otp="true"
                            type="text"
                            @update:model-value="handleModelValueUpdate"
                          >
                            <ShadcnPinInputGroup>
                              <ShadcnPinInputInput
                                v-for="(id, index) in 5"
                                :key="id"
                                :index="index"
                                :value="otp?.[index] ?? ''"
                              />
                            </ShadcnPinInputGroup>
                          </ShadcnPinInput>
                        </div>
                      </ShadcnFormControl>
                      <ShadcnFormDescription>
                        The 5-digit code sent to your email.
                      </ShadcnFormDescription>
                      <ShadcnFormMessage />
                    </ShadcnFormItem>
                  </ShadcnFormField>
                </template>

                <template v-if="stepIndex === 3">
                  <ShadcnFormField
                    v-slot="{ value, handleChange }"
                    name="password"
                    :validate-on-blur="!isFieldDirty"
                  >
                    <ShadcnFormItem>
                      <ShadcnFormLabel>Password</ShadcnFormLabel>
                      <ShadcnFormControl>
                        <div class="relative">
                          <PasswordInput
                            :model-value="value"
                            :on-enter="onSubmit"
                            @update:model-value="
                              ($event) => {
                                handleChange($event);
                                setFieldValue('password', $event);
                              }
                            "
                          />
                        </div>
                      </ShadcnFormControl>
                      <ShadcnFormDescription>
                        Your new password.
                      </ShadcnFormDescription>
                      <ShadcnFormMessage />
                    </ShadcnFormItem>
                  </ShadcnFormField>
                </template>
              </div>

              <div class="flex gap-1 mt-4">
                <ShadcnButton
                  :disabled="isPrevDisabled"
                  variant="outline"
                  size="sm"
                  @click="prevStep()"
                >
                  Back
                </ShadcnButton>
                <div class="flex items-center gap-3">
                  <ShadcnButton
                    :disabled="!canGoNext"
                    size="sm"
                    @click="
                      stepIndex !== 3
                        ? stepIndex === 1
                          ? sendOtpEmail(values.email as string).then(() =>
                            nextStep(),
                          )
                          : nextStep()
                        : onSubmit()
                    "
                  >
                    {{ stepIndex !== 3 ? 'Next' : 'Set new password' }}
                  </ShadcnButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ShadcnStepper>
    </ShadcnForm>
  </div>
</template>

<style scoped></style>
