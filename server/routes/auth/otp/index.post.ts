import crypto from 'node:crypto'
import { render } from '@vue-email/render'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import Otp from '~/components/emails/otp.vue'

const MailConfigSchema = z.object({
  mail: z.object({
    smtp: z.object({
      host: z.string(),
      port: z.number(),
    }),
    secure: z.boolean(),
    username: z.string(),
    password: z.string(),
  }),
})

async function sendMail({ to, subject, html, text }: { to: string, subject: string, html: string, text: string }) {
  const runtimeConfig = useRuntimeConfig()
  const { mail } = MailConfigSchema.parse(runtimeConfig)

  const transporter = nodemailer.createTransport({
    host: mail.smtp.host,
    port: mail.smtp.port,
    secure: mail.secure,
    auth: {
      user: mail.username,
      pass: mail.password,
    },
    tls: {
      // must provide server name, otherwise TLS certificate check will fail
      servername: mail.smtp.host,
    },
  })

  return transporter.sendMail({
    from: `"Password Reset - NeptunAI" <no-reply@neptunai.jonasfroeller.online>`,
    to,
    subject,
    html,
    text,
  })
}

interface OtpCreateBody {
  action: 'create'
  email: string
}

interface OtpValidateBody {
  action: 'validate'
  email: string
  otp: string
  new_password: string
}

type OtpRequestBody = OtpCreateBody | OtpValidateBody

export default defineEventHandler(async (event) => {
  const storage = useStorage('temporary-storage')
  const otpNameSpace = 'otp'

  const body = await readBody<OtpRequestBody>(event)

  if (body.action === 'create') {
    const { email } = body
    const otp = generateOTP()

    // Store OTP in storage
    await storage.setItem(`${otpNameSpace}:${email}`, {
      otp,
      createdAt: Date.now(),
    }, { ttl: 600 }) // 10 minutes

    // Email content
    const html = await render(Otp, {
      otp,
    }, {
      pretty: true,
    })

    const text = await render(Otp, {
      otp,
    }, {
      pretty: true,
      plainText: true,
    })

    // Send OTP email
    try {
      /* const response =  */
      await sendMail({
        to: email,
        subject: 'Your Password Reset OTP',
        html,
        text,
      })
    } catch {
      return { success: false, message: 'Something went wrong. Could not send OTP. Please try again.' }
    }

    return { success: true, message: 'Successfully sent OTP.' }
  }

  if (body.action === 'validate') {
    const { email, otp, new_password } = body

    try {
      // @ts-ignore: sometimes not inferrable
      return await event.$fetch(`/${email}/reset-password`, {
        method: 'POST',
        body: { otp, new_password },
      })
    } catch {
      return { success: false, message: 'Something went wrong. Could not validate OTP. Please try again.' }
    }
  }

  return { success: false, message: 'Invalid action.' }
})

function generateOTP() {
  return Array.from({ length: 5 }, () => crypto.randomInt(0, 10).toString()).join('')
}
