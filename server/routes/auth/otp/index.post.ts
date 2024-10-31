import nodemailer from 'nodemailer';
import crypto from "crypto";

const storage = useStorage('otp');

const sendMail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
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
        text,
    });
};

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (body.action === 'create') {
        const { email } = body;
        const otp = generateOTP();

        // Store OTP in storage
        await storage.setItem(email, {
            otp: otp,
            createdAt: Date.now(),
        }, { ttl: 600 }); // 10 minutes

        // Send OTP email
        await sendMail({
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. This code will expire in 10 minutes.`,
        });

        return { success: true, message: 'Successfully sent OTP.' };
    }

    if (body.action === 'validate') {
        const { email, otp, new_password } = body;

        return await event.$fetch(`/${email}/reset-password`, {
            method: 'POST',
            body: { otp, new_password },
        });
    }

    return { success: false, message: 'Invalid action.' };
});

const generateOTP = () => {
    return Array.from({ length: 5 }, () => crypto.randomInt(0, 10).toString()).join("");
};
