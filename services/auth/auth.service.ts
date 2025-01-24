import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import transport from '../../utils/sendMail';
import { doHash, doHashValidation, hmacProcess } from '../../utils/hashing';
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { verifyForgotPasswordSchema, verificationCodeSchema, changePasswordSchema, loginSchema, registerSchema } from "../../utils/validators";

class AuthService {

    //Registration 
    async registerUser(email: string, password: string) {
        const existingUser = await User.findOne({ email });

        const { error, value } = registerSchema.validate({ email, password });
        if (error) {
            throw new Error(error.details[0].message);
        }
        if (existingUser) {
            throw new Error('User already exists!');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            email,
            password: hashedPassword,
        });
        await newUser.save();
        return newUser;
    }

    //Login
    async loginUser(email: string, password: string) {
        const user = await User.findOne({ email });

        const { error, value } = loginSchema.validate({ email, password });
        if (error) {
            throw new Error(error.details[0].message);
        }

        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error('Invalid email or password');
        }
        const token = jwt.sign({ userId: user._id, email: user.email, verified: user.verified }, process.env.TOKEN_SECRET as string, { expiresIn: '8h' });
        return {
            user,
            token,
        };
    }

    //Send verfication code to email address
    async sendVerificationCode(req: any) {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }
        if (existingUser.verified) {
            return { success: false, message: 'Your are already verified!' };
        }
        const emailTemplateSource = fs.readFileSync(path.join('./templates/send-verification-code.hbs'), "utf8");
        const template = handlebars.compile(emailTemplateSource);
        req.body.verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();
        const htmlToSend = template({ data: req.body })

        let info = await transport.sendMail({
            from: process.env.EMAIL,
            to: existingUser.email,
            subject: 'Verify Account',
            html: htmlToSend
        });
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(req.body.verificationCode, process.env.HMAC_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return { success: true, message: 'Verification code has been sent to your email!' };
        }
        return { success: false, message: 'Failed to sent the verification code!' };

    }

    // Verfiy verification code that been sent to the email address
    async verifVerificationCode(email: any, providedCode: any) {
        const code = providedCode.toString();
        const existingUser = await User.findOne({ email });

        const { error, value } = verificationCodeSchema.validate({ email, providedCode });
        if (error) {
            return { success: false, message: error.details[0].message, statusCode: 401 };
        }

        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }

        if (existingUser.verified) {
            return { success: false, message: 'You are already verify!' };
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return { success: false, message: 'Something is wrong with the code!' };
        }

        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return { success: false, message: 'Code has been expired!' };
        }

        const hashedCode = hmacProcess(code, process.env.HMAC_CODE_SECRET);
        if (hashedCode === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return { success: true, message: 'Your account has been verified!' };
        }

        return { success: true, message: 'Something went wrong!' };
    }

    // Reset password
    async changePassword(userId: string, verified: boolean, oldPassword: string, newPassword: string) {
        try {
            const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });
            if (error) {
                return { success: false, message: error.details[0].message, statusCode: 401 };
            }

            if (!verified) {
                return { success: false, message: 'You are not a verified user!' };
            }
            const existingUser = await User.findOne({ _id: userId }).select('+password');
            if (!existingUser) {
                return { success: false, message: 'User does not exist!' };
            }
            const isPasswordValid = await doHashValidation(oldPassword, existingUser.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Invalid credentials!' };
            }
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            await existingUser.save();
            return { success: true, message: 'Your password has been changed!' };
        } catch (error) {
            console.error('Error in changePassword service:', error);
            return { success: false, message: 'Something went wrong!' };
        }
    }

    // Send code to email address if password has forgot
    async sendForgotPasswordCode(req: any) {
        const { email } = req.body;

        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }

        const emailTemplateSource = fs.readFileSync(path.join('./templates/send-forgot-password-code.hbs'), "utf8");
        const template = handlebars.compile(emailTemplateSource);
        req.body.verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();
        const htmlToSend = template({ data: req.body })

        let info = await transport.sendMail({
            from: process.env.EMAIL,
            to: existingUser.email,
            subject: 'Forgot Password',
            html: htmlToSend
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(req.body.verificationCode, process.env.HMAC_CODE_SECRET);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return { success: true, message: 'Forgot password code has been sent to your email!' };
        }
        return { success: false, message: 'Failed to sent the forgot password code!' };
    }

    // Verify code that been sent to the email address to reset password after forgot
    async verifyForgotPasswordCode(email: string, providedCode: any, newPassword: string) {
        const code = providedCode.toString();
        const existingUser = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
        const { error, value } = verifyForgotPasswordSchema.validate({ email, providedCode, newPassword });
        if (error) {
            return { success: false, message: error.details[0].message, statusCode: 401 };
        }
        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }
        if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return { success: false, message: 'Something is wrong with the code!' };
        }
        if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return { success: false, message: 'Code has been expired!' };
        }
        const hashedCode = hmacProcess(code, process.env.HMAC_CODE_SECRET);
        if (hashedCode === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return { success: true, message: 'Password has been changed!' };
        }
        return { success: false, message: 'Something went wrong!' };
    }

}

export const authService = new AuthService();
