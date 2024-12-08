import nodemailer from 'nodemailer';
import crypto from "crypto";
import { render } from '@vue-email/render';
import Otp from '~/components/emails/otp.vue';

const sendMail = async ({ to, subject, html, text }: { to: string; subject: string; html: string, text: string }) => {
    const config = useRuntimeConfig();
    const transporter = nodemailer.createTransport({
        host: config.mail.smtp.host,
        port: config.mail.smtp.port,
        secure: config.mail.secure,
        auth: {
            user: config.mail.username,
            pass: config.mail.password,
        },
        tls: {
            // must provide server name, otherwise TLS certificate check will fail
            servername: config.mail.smtp.host
        }
    });

    return transporter.sendMail({
        from: `"Password Reset - NeptunAI" <no-reply@neptunai.jonasfroeller.online>`,
        to,
        subject,
        html,
        text,
    });
};

export default defineEventHandler(async (event) => {
    const storage = useStorage('temporary-storage');
    const otpNameSpace = "otp";

    const body = await readBody(event);

    if (body.action === 'create') {
        const { email } = body;
        const otp = generateOTP();

        // Store OTP in storage
        await storage.setItem(`${otpNameSpace}:${email}`, {
            otp: otp,
            createdAt: Date.now(),
        }, { ttl: 600 }); // 10 minutes

        // Email content
        const html = await render(Otp, {
            otp,
        }, {
            pretty: true,
        });

        const text = await render(Otp, {
            otp,
        }, {
            pretty: true,
            plainText: true,
        });

        // Send OTP email
        try {
            /* const response =  */
            await sendMail({
                to: email,
                subject: 'Your Password Reset OTP',
                html: html,
                text: text,
            });
        } catch (error) {
            return { success: false, message: 'Something went wrong. Could not send OTP. Please try again.' };
        }

        return { success: true, message: 'Successfully sent OTP.' };
    }

    if (body.action === 'validate') {
        const { email, otp, new_password } = body;

        try {
            return await event.$fetch(`/${email}/reset-password`, {
                method: 'POST',
                body: { otp, new_password },
            });
        } catch (error) {
            return { success: false, message: 'Something went wrong. Could not validate OTP. Please try again.' };
        }
    }

    return { success: false, message: 'Invalid action.' };
});

const generateOTP = () => {
    return Array.from({ length: 5 }, () => crypto.randomInt(0, 10).toString()).join("");
};
