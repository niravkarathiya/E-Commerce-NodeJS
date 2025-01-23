// services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import transport from '../../middlewares/auth/sendMail.middleware';
import { doHash, doHashValidation, hmacProcess } from '../../utils/hashing';

class AuthService {
    //Registration 
    async registerUser(email: string, password: string) {
        const existingUser = await User.findOne({ email });
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
    async sendVerificationCode(email: string) {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }
        if (existingUser.verified) {
            return { success: false, message: 'Your are already verified!' };
        }
        const verificationCode = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.EMAIL,
            to: existingUser.email,
            subject: 'Verify Account',
            html: '<h1>' + verificationCode + '</h1>'
        });
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(verificationCode, process.env.HMAC_CODE_SECRET);
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
    async sendForgotPasswordCode(email: string) {
        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            return { success: false, message: 'User does not exists!' };
        }
        const verificationCode = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.EMAIL,
            to: existingUser.email,
            subject: 'Forgot Password',
            html: '<h1>' + verificationCode + '</h1>'
        });
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(verificationCode, process.env.HMAC_CODE_SECRET);
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
