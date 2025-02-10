import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { hmacProcess } from './hashing';

// Transport for email sending
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


const sendEmail = async ({ templatePath, emailData, subject, emailType, user }: any) => {
    try {
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, templatePath), 'utf8');
        const template = handlebars.compile(emailTemplateSource);

        const htmlToSend = template({ data: emailData });

        let info = await transport.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject,
            html: htmlToSend
        });

        if (info.accepted[0] === user.email) {
            if (emailType === 'register') {
                await user.save();
                return { success: true, statusCode: 200, email: user.email, message: 'User registered successfully. Please check your mailbox to verify your email!' };
            } else if (emailType === 'verify') {
                const hashedCodeValue = hmacProcess(emailData.verificationCode, process.env.HMAC_CODE_SECRET);
                user.verificationCode = hashedCodeValue;
                user.verificationCodeValidation = Date.now();
                await user.save();
                return { success: true, message: 'Verification code has been sent to your email!', statusCode: 200, };
            } else if (emailType === 'forgotPassword') {
                const hashedCodeValue = hmacProcess(emailData.verificationCode, process.env.HMAC_CODE_SECRET);
                user.forgotPasswordCode = hashedCodeValue;
                user.forgotPasswordCodeValidation = Date.now();
                await user.save();
                return { success: true, statusCode: 200, status: true, message: 'Forgot password code has been sent to your email!' };
            }
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, statusCode: 400, status: false, message: 'An error occurred while sending the email.' };
    }
}

export { transport, sendEmail };
