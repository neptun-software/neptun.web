<script setup lang="ts">
import {
  Preview,
  Html,
  Head,
  Tailwind,
  Container,
  Row,
  Section,
  Heading,
  Text,
  CodeInline,
  Hr,
  Link,
  Img,
  Font,
} from '@vue-email/components';
import { emailTheme } from './tailwind';

defineProps({
  otp: String,
});
</script>

<template>
  <Preview>Password Reset OTP for NeptunAI</Preview>
  <Html lang="en" dir="ltr" style="background-color: #020817; color: #f8fafc">
    <Head>
      <title>Password Reset OTP - NeptunAI</title>
      <meta name="description" content="You have requested a password reset." />
      <Font
        font-family="Roboto"
        fallback-font-family="Verdana"
        :font-weight="400"
        font-style="normal"
      />
    </Head>
    <Tailwind
      :config="{
        /* @ts-ignore: I don't care */
        theme: {
          ...emailTheme,
        },
      }"
    >
      <Container class="p-4">
        <Section class="text-center">
          <Row>
            <Heading as="h1" class="text-primary-foreground">
              Password Reset OTP
            </Heading>
          </Row>
          <Row>
            <Text class="text-secondary">
              Your OTP for password reset is:
              <CodeInline> {{ otp }}. </CodeInline>
            </Text>
            <Text class="italic text-muted">
              This code will expire in 10 minutes.
            </Text>
          </Row>
        </Section>

        <Hr />

        <Section>
          <Container class="text-center">
            <Img
              src="https://neptun-webui.vercel.app/favicon.png"
              alt="logo"
              width="100"
              height="100"
              class="mx-auto mt-2 mb-4"
            />
            <Link
              href="https://neptun-webui.vercel.app/home"
              class="block text-blue-500 underline hover:no-underline"
            >
              visit NeptunAI website
            </Link>
          </Container>
        </Section>
      </Container>
    </Tailwind>
  </Html>
</template>
