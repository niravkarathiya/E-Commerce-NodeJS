// controllers/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';

class AuthController {

    async register(req: Request, res: Response, next: NextFunction) {
        const { email, password, username, role } = req.body;
        try {
            const newUser = await authService.registerUserWithEmailVerify(email, password, username, role);

            res.json({
                statusCode: newUser?.statusCode,
                message: newUser?.message,
                status: newUser?.status,
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
            const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
            res
                .cookie('Authorization', `Bearer ${accessToken}`, {
                    expires: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes for access token
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                })
                .cookie('RefreshToken', refreshToken, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for refresh token
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                })
                .json({
                    statusCode: 200,
                    message: 'Login successfully!',
                    data: { email: user?.email, phone: user?.phone, cartCount: user.cartCount, username: user?.username, id: user._id, avatar: user?.avatar, token: accessToken },
                    status: true,
                });
        } catch (err: any) {
            const error = {
                status: 401,
                message: err.message || 'Login failed!',
            };
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.RefreshToken;
            if (!refreshToken) throw new Error('Refresh token is missing');

            const { newAccessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken);

            res
                .cookie('Authorization', `Bearer ${newAccessToken}`, {
                    expires: new Date(Date.now() + 2 * 60 * 1000),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                })
                .cookie('RefreshToken', newRefreshToken, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                })
                .json({
                    statusCode: 200,
                    message: 'Access token refreshed successfully',
                    accessToken: newAccessToken,
                });
        } catch (err: any) {
            next({
                status: 401,
                message: err.message || 'Unable to refresh access token',
            });
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
        const { _id, verified } = req.user;
        const { oldPassword, newPassword } = req.body;
        try {
            const result = await authService.changePassword(_id, verified, oldPassword, newPassword);
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

    async verifyForgotPasswordCode(req: any, res: Response, next: NextFunction) {
        const { email, providedCode, newPassword } = req.body;
        try {
            const result = await authService.verifyForgotPasswordCode(email, providedCode, newPassword);
            res.json({
                success: result.success,
                message: result.message,
                data: [],
                statusCode: result.success ? 200 : result.statusCode,
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
        const { username } = req.body;
        const avatar = req.file;

        try {
            if (!username && !avatar) {
                return next({ message: 'No fields provided to update the profile!!', status: 400 });
            }

            const updatedUser = await authService.updateUserProfile(_id, username, avatar);

            if (!updatedUser.success) {
                return next({ message: 'Profile update failed!', status: 400 });
            }

            res.status(200).json({
                success: true,
                message: updatedUser.message,
                data: updatedUser.data,
                statusCode: 200,
            });

        } catch (err: any) {
            next({ message: err.message || 'Internal Server Error', status: 500 });
        }
    }
}

export const authController = new AuthController();
