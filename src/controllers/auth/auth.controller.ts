// controllers/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';

class AuthController {


    async register(req: Request, res: Response, next: NextFunction) {
        const { email, password, username } = req.body;
        try {
            const newUser = await authService.registerUserWithEmailVerify(email, password, username);

            res.json({
                statusCode: newUser?.statusCode,
                message: newUser?.message,
                status: true,
            })
        } catch (err: any) {
            const error = {
                status: 400,
                message: err.errors[0].message || 'Registration failed',
            };
            next(error);
        }
    }

    async verifyUserEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.verifyUserEmail(req);
            res.status(result.success ? 200 : 400).json(result);
        } catch (err: any) {
            const error = {
                status: 500,
                message: err.errors[0].message || 'Internal Server Error',
            };
            next(error);
        }
    }


    async login(req: Request, res: Response, next: NextFunction) {
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
        } catch (err: any) {
            const error = {
                status: 401,
                message: err.errors[0].message || 'Login failed!',
            };
            next(error);
        }
    }


    async sendVerificationCode(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.sendVerificationCode(req);

            res.json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (err: any) {
            const error = {
                status: 500,
                message: err.errors[0].message || 'Internal Server Error',
            };
            next(error);
        }
    }


    async verifyVerificationCode(req: Request, res: Response, next: NextFunction) {
        const { email, providedCode } = req.body;
        try {
            const result = await authService.verifVerificationCode(email, providedCode);
            res.status(result.success ? 200 : 400).json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (err: any) {
            const error = {
                status: 500,
                message: err.errors[0].message || 'Internal Server Error',
            };
            next(error);
        }
    }



    async changePassword(req: any, res: any, next: NextFunction) {
        const { userId, verified } = req.user;
        const { oldPassword, newPassword } = req.body;
        try {
            const result = await authService.changePassword(userId, verified, oldPassword, newPassword);
            res.status(result.success ? 200 : 401).json({
                success: result.success,
                message: result.message,
                statusCode: result.success ? 200 : 401,
            });
        } catch (err: any) {
            const error = {
                message: err.errors[0].message || 'Error in change password!',
                status: 500,
            }
            next(error);
        }
    }

    async sendForgotCode(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.sendForgotPasswordCode(req);
            res.json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (err: any) {
            const error = {
                message: err.errors[0].message || 'Internal Server Error',
                status: 500,
            }
            next(error);
        }
    }

    async verifyForgotPasswordCode(req: Request, res: Response, next: NextFunction) {
        const { email, providedCode, newPassword } = req.body;
        try {
            const result = await authService.verifyForgotPasswordCode(email, providedCode, newPassword);
            res.status(result.success ? 200 : 400).json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : 400,
            });
        } catch (err: any) {
            const error = {
                message: err.errors?.[0]?.message || 'Internal Server Error',
                status: 500,
            };
            next(error);
        }
    }

    async signOut(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('Authorization').status(200).json({
                success: true,
                message: 'Logged out successfully!',
                data: [],
                statusCode: 200,
            });
        } catch (err: any) {
            const error = {
                message: err.errors?.[0]?.message || 'Internal Server Error',
                status: 500,
            };
            next(error);
        }
    }

    async updateProfile(req: any, res: Response, next: NextFunction) {
        const { _id } = req.user;
        const { username, avatar } = req.body;

        try {
            if (!username && !avatar) {
                const error = {
                    message: 'No fields provided to update the profile!!',
                    status: 400,
                };
                next(error);
            }

            // Update user information in the service layer
            const updatedUser = await authService.updateUserProfile(_id, username, avatar);

            if (!updatedUser) {
                const error = {
                    message: 'Profile update failed.!',
                    status: 400,
                };
                next(error);
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

        } catch (err: any) {
            const error = {
                message: err.errors?.[0]?.message || 'Internal Server Error',
                status: 500,
            };
            next(error);
        }
    }
}

export const authController = new AuthController();
