<script setup lang="ts">
import { CheckIcon, CircleIcon, DotIcon } from '@radix-icons/vue';
import { toast } from 'vue-sonner';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { emailSchema, passwordSchema } from '~/lib/types/input.validation';

definePageMeta({
  name: 'New Password',
  alias: ['/forgot-password', '/reset-password']
});

// defineOgImageComponent('NuxtSeo');

const stepIndex = ref(1);
const steps = [
  {
    step: 1,
    title: 'Email',
    description: 'Enter your email address'
  },
  {
    step: 2,
    title: 'OTP',
    description: 'Enter your onetime password'
  },
  {
    step: 3,
    title: 'New Password',
    description: 'Enter your new password'
  }
];

const formSchema = [
  z.object({
    email: emailSchema
  }),
  z.object({
    /* TODO: make this work. Somehow displays "Required", even if it's a valid input and the input is set
      .array(z.string().min(1, { message: 'Required' }))
      .length(5, { message: 'Invalid input' }),
    */
    /* otp: z.array(z.string()).superRefine((arr, ctx) => {
      // Check if the OTP array has exactly 5 elements
      if (arr.length !== 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OTP must be 5 digits',
        });
      }
      // Check if each element in the OTP array is a non-empty string
      arr.forEach((value, index) => {
        if (!value || value.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Each OTP digit is required',
            path: [index], // Provide the index for better error handling
          });
        }
      });

      // TODO: validate the OTP
    }), */
    otp: z.any()
  }),
  z.object({
    password: passwordSchema
  })
];

const otp = ref(Array(5).fill(''));
const otpIsValid = ref(false);
const schema = computed(() => toTypedSchema(formSchema[stepIndex.value - 1]));
const { isFieldDirty, handleSubmit, setFieldValue, validate } = useForm();

const onSubmit = handleSubmit((values) => {
  toast('You submitted the following values:', {
    description: h(
      'pre',
      { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' },
      h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))
    )
  });
});

const handleComplete = (/* e: string[] */) => {
  // console.log('Completed OTP:', e.join(''));
  otpIsValid.value = true;
};

const handleModelValueUpdate = (arrStr: string[]) => {
  arrStr.forEach((val, index) => {
    if (otp.value[index] !== val) {
      otp.value[index] = val;
    }
  });

  // console.log('Updated model value:', otp.value);
  setFieldValue('otp', [...otp.value]);
  validate();

  if (otp.value.length === 5 && !otp.value.includes('')) {
    handleComplete(otp.value);
  }
};
</script>

<template>
  <!-- TODO: needs email verification -->
  <div class="p-4">
    <span class="flex justify-center pb-4">(WIP)</span>
    <ShadcnForm
      v-slot="{ meta }"
      keep-values
      class="flex flex-col items-center space-y-6"
      as=""
      :validation-schema="schema"
    >
      <ShadcnStepper
        v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
        v-model="stepIndex"
        class="block w-full"
      >
        <form @submit="onSubmit">
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
                      && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                  ]"
                  :disabled="state !== 'completed' && !meta.valid"
                >
                  <CheckIcon
                    v-if="state === 'completed'"
                    class="size-5"
                  />
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
                      <ShadcnFormLabel> Email</ShadcnFormLabel>
                      <ShadcnFormControl>
                        <ShadcnInput
                          type="email"
                          placeholder="your.name@domain.tld"
                          v-bind="componentField"
                          @update:model-value="setFieldValue('email', $event)"
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
                      </ShadcnFormControl>
                      <ShadcnFormDescription>
                        The 6-digit code sent to your email.
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
                    v-if="stepIndex !== 3"
                    :type="meta.valid ? 'button' : 'submit'"
                    :disabled="
                      isNextDisabled || (stepIndex === 2 && !otpIsValid)
                    "
                    size="sm"
                    @click="meta.valid && nextStep()"
                  >
                    Next
                  </ShadcnButton>
                  <ShadcnButton
                    v-if="stepIndex === 3"
                    size="sm"
                    type="submit"
                  >
                    Set new password
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
