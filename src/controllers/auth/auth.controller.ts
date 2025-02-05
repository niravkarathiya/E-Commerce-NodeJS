// controllers/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from './auth.service';

class AuthController {


    async register(req: Request, res: Response) {
        const { email, password, username } = req.body;
        try {
            const newUser = await authService.registerUserWithEmailVerify(email, password, username);

            res.json({
                statusCode: newUser?.statusCode,
                message: newUser?.message,
                status: true,
            })
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Registration failed',
                status: false,
            })
        }
    }

    async verifyUserEmail(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.verifyUserEmail(req);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    }


    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const { user, token } = await authService.loginUser(email, password);
            res.cookie('Authorization', `Bearer ${token}`, {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            }).json({
                statusCode: 200,
                message: 'Login successful',
                data: { email: user?.email, token, username: user?.username },
                status: true,
            })
        } catch (error: any) {
            res.json({
                statusCode: 401,
                message: error.message || 'Login failed',
                status: false
            })
        }
    }


    async sendVerificationCode(req: Request, res: Response) {
        try {
            const result = await authService.sendVerificationCode(req);

            res.json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }


    async verifyVerificationCode(req: Request, res: Response) {
        const { email, providedCode } = req.body;
        try {
            const result = await authService.verifVerificationCode(email, providedCode);
            res.status(result.success ? 200 : 400).json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }



    async changePassword(req: any, res: any) {
        const { userId, verified } = req.user;
        const { oldPassword, newPassword } = req.body;
        try {
            const result = await authService.changePassword(userId, verified, oldPassword, newPassword);
            res.status(result.success ? 200 : 401).json({
                success: result.success,
                message: result.message,
                statusCode: result.success ? 200 : 401,
            });
        } catch (error) {
            console.error('Error in changePassword controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }

    async sendForgotCode(req: Request, res: Response) {
        try {
            const result = await authService.sendForgotPasswordCode(req);
            res.json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }

    async verifyForgotPasswordCode(req: Request, res: Response) {
        const { email, providedCode, newPassword } = req.body;
        try {
            const result = await authService.verifyForgotPasswordCode(email, providedCode, newPassword);
            res.status(result.success ? 200 : 400).json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }

    async signOut(req: Request, res: Response) {

        try {
            res.clearCookie('Authorization').status(200).json({
                success: true,
                message: 'Logged out successfully!',
                data: [],
                statusCode: 200,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }

    async updateProfile(req: any, res: Response) {
        const { _id } = req.user;
        const { username, avatar } = req.body;

        try {
            if (!username && !avatar) {
                res.status(400).json({
                    success: false,
                    message: 'No profile fields provided to update.',
                    data: [],
                    statusCode: 400,
                });
            }

            // Update user information in the service layer
            const updatedUser = await authService.updateUserProfile(_id,
                username,
                avatar,
            );

            if (!updatedUser) {
                res.status(400).json({
                    success: false,
                    message: 'Profile update failed.',
                    data: [],
                    statusCode: 400,
                });
            }

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully.',
                data: {
                    username: updatedUser?.data?.username,
                    avatar: updatedUser?.data?.avatar,
                },
                statusCode: 200,
            });

        } catch (error) {
            console.error('Error in updateProfile controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                data: [],
                statusCode: 500,
            });
        }
    }

}

export const authController = new AuthController();
