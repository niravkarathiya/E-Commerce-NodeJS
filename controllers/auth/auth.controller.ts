// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth/auth.service';

class AuthController {

    // User Registration
    async register(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        try {
            const newUser = await authService.registerUser(email, password);

            res.json({
                statusCode: 201,
                message: 'User registered successfully',
                data: { email: newUser?.email },
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

    // User Login
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
                data: { email: user?.email, token },
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

    //send verification code
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

    //verify verification code 
    async verifyVerificationCode(req: Request, res: Response) {
        const { email, providedCode } = req.body; // Get the email and provided verification code from request body
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

    //reset password
    async changePassword(req: any, res: any) {
        const { userId, verified } = req.user;
        const { oldPassword, newPassword } = req.body;
        try {
            const result = await authService.changePassword(userId, verified, oldPassword, newPassword);
            res.status(result.success ? 200 : 401).json({
                success: result.success,
                message: result.message,
                data: [],
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

    //send forgot password code
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

    //verify forgot password code
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
}

export const authController = new AuthController();
