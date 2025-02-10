import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './auth.model';
import { doHash, doHashValidation, hmacProcess } from '../../utils/hashing';
import { verifyForgotPasswordSchema, verificationCodeSchema, changePasswordSchema, loginSchema, registerSchema } from "./auth.validators";
import { sendEmail } from '../../utils/sendMail';
import cloudinary from '../../utils/cloudinary.config';

class AuthService {

    async registerUser(email: string, password: string, username: string) {
        const defaultAvatarBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAg0B7kH4VQAAAABJRU5ErkJggg==";
        const existingUser = await User.findOne({ email });
        const { error } = registerSchema.validate({ email, password });

        if (error) throw new Error(error.details[0].message);
        if (existingUser) throw new Error('User already exists!');

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ email, password: hashedPassword, avatar: defaultAvatarBase64, username });
        await newUser.save();
        return newUser;
    }

    async registerUserWithEmailVerify(email: string, password: string, username: string) {
        try {
            const defaultAvatarBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAg0B7kH4VQAAAABJRU5ErkJggg==";
            const { error } = registerSchema.validate({ email, password });
            if (error) throw new Error(error.details[0].message);

            const existingUser = await User.findOne({ email });
            if (existingUser) return { success: false, message: 'User already exists!', statusCode: 409 }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new User({ email, password: hashedPassword, avatar: defaultAvatarBase64, username, verified: false });
            const verificationLink = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}`;
            const emailData = { verificationLink };

            return await sendEmail({
                templatePath: '../templates/send-verification-link.hbs',
                emailData,
                subject: 'Verify Account',
                emailType: 'register',
                user: newUser
            });

        } catch (err: any) {
            return { success: false, message: err.message, statusCode: 400 };
        }
    }

    async verifyUserEmail(req: any) {
        try {
            const { email } = req.query;
            if (!email) return { success: false, message: 'Invalid verification link.' };

            const user = await User.findOne({ email });
            if (!user) return { success: false, message: 'User not found.' };

            if (user.verified) return { success: false, message: 'User already verified.' };

            user.verified = true;
            await user.save();

            return { success: true, message: 'Email verified successfully!' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }

    async loginUser(email: string, password: string) {
        const user = await User.findOne({ email });
        const { error } = loginSchema.validate({ email, password });

        if (error) throw new Error(error.details[0].message);
        if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid email or password');

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Store refresh token in the schema
        user.refreshToken = refreshToken;
        await user.save();

        return { user, accessToken, refreshToken };
    }

    generateAccessToken(user: any) {
        return jwt.sign(
            { _id: user._id, verified: user.verified },
            process.env.TOKEN_SECRET as string,
            { expiresIn: '8h' }
        );
    }

    generateRefreshToken(user: any) {
        return jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as any;

            const user = await User.findById(payload._id);
            if (!user || user.refreshToken !== refreshToken) {
                throw new Error('Invalid or mismatched refresh token');
            }

            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            user.refreshToken = newRefreshToken;
            await user.save();

            return { newAccessToken, newRefreshToken };
        } catch (err) {
            throw new Error('Refresh token is invalid or expired, Please login again!');
        }
    }

    async sendVerificationCode(req: any) {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) return { success: false, message: 'User does not exist!' };
        if (existingUser.verified) return { success: false, message: 'You are already verified!' };

        req.body.verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();
        const emailData = { verificationCode: req.body.verificationCode };

        const result = await sendEmail({
            templatePath: '../templates/send-verification-code.hbs',
            emailData,
            subject: 'Verify Account',
            emailType: 'verify',
            user: existingUser
        });

        if (result?.success) {
            const hashedCodeValue = hmacProcess(req.body.verificationCode, process.env.HMAC_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return { success: true, message: 'Verification code has been sent to your email!' };
        } else {
            return { success: false, message: 'Failed to send the verification code!' };
        }
    }

    async verifVerificationCode(email: any, providedCode: any) {
        const code = providedCode.toString();
        const existingUser = await User.findOne({ email });
        const { error } = verificationCodeSchema.validate({ email, providedCode });

        if (error) return { success: false, message: error.details[0].message, statusCode: 401 };
        if (!existingUser || existingUser.verified) return { success: false, message: 'User does not exist or is already verified!' };
        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) return { success: false, message: 'Something is wrong with the code!' };
        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) return { success: false, message: 'Code has been expired!' };

        const hashedCode = hmacProcess(code, process.env.HMAC_CODE_SECRET);
        if (hashedCode === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return { success: true, message: 'Your account has been verified!' };
        }

        return { success: false, message: 'Something went wrong!' };
    }

    async changePassword(userId: string, verified: boolean, oldPassword: string, newPassword: string) {
        try {
            const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
            if (error) return { success: false, message: error.details[0].message, statusCode: 401 };
            if (!verified) return { success: false, message: 'You are not a verified user!' };

            const existingUser = await User.findOne({ _id: userId }).select('+password');
            if (!existingUser || !(await doHashValidation(oldPassword, existingUser.password))) return { success: false, message: 'Invalid credentials!' };

            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            await existingUser.save();
            return { success: true, message: 'Your password has been changed!' };
        } catch (error) {
            console.error('Error in changePassword service:', error);
            return { success: false, message: 'Something went wrong!' };
        }
    }

    async sendForgotPasswordCode(req: any) {
        const { email } = req.body;
        const existingUser = await User.findOne({ email }).select('+password');

        if (!existingUser) return { success: false, message: 'User does not exist!' };

        req.body.verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();
        const emailData = { verificationCode: req.body.verificationCode };
        const result = await sendEmail({
            templatePath: '../templates/send-forgot-password-code.hbs',
            emailData,
            subject: 'Forgot Password',
            emailType: 'forgotPassword',
            user: existingUser
        });

        if (result?.success) {
            const hashedCodeValue = hmacProcess(req.body.verificationCode, process.env.HMAC_CODE_SECRET);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return { success: true, message: 'Forgot password code has been sent to your email!' };
        } else {
            return { success: false, message: 'Failed to send the forgot password code!' };
        }
    }

    async verifyForgotPasswordCode(email: string, providedCode: any, newPassword: string) {
        const code = providedCode.toString();
        const existingUser = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
        const { error } = verifyForgotPasswordSchema.validate({ email, providedCode, newPassword });

        if (error) return { success: false, message: error.details[0].message, statusCode: 401 };
        if (!existingUser || !existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) return { success: false, message: 'Something is wrong with the code!' };
        if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) return { success: false, message: 'Code has been expired!' };

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

    async updateUserProfile(userId: string, username?: string, avatarFile?: Express.Multer.File) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            if (username) user.username = username;

            if (avatarFile) {
                // Upload the avatar to Cloudinary
                const uploadResult = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "user_uploads" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(avatarFile.buffer);
                });

                user.avatar = uploadResult.secure_url;
            }

            await user.save();

            return {
                success: true,
                message: 'Profile updated successfully!',
                data: { username: user.username, avatar: user.avatar },
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

}

export const authService = new AuthService();
