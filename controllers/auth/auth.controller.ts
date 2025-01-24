// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth/auth.service';


/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: strongpassword123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         token:
 *           type: string
 *     SendVerificationCodeRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *     VerifyVerificationCodeRequest:
 *       type: object
 *       required:
 *         - email
 *         - providedCode
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         providedCode:
 *           type: string
 *           example: 123456
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           example: oldpassword123
 *         newPassword:
 *           type: string
 *           example: newpassword456
 *     VerifyForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - providedCode
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         providedCode:
 *           type: string
 *           example: 123456
 *         newPassword:
 *           type: string
 *           example: newpassword456
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for user authentication and authorization
 */
class AuthController {

    /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                 message:
   *                   type: string
   *                   example: User registered successfully
   *                 status:
   *                   type: boolean
   */
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

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *       401:
     *         description: Login failed
     */
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

    /**
 * @swagger
 * /auth/send-verification-code:
 *   post:
 *     summary: Send a verification code to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 statusCode:
 *                   type: integer
 *       400:
 *         description: Failed to send verification code
 *       500:
 *         description: Internal Server Error
 */
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

    /**
  * @swagger
  * /auth/verify-verification-code:
  *   post:
  *     summary: Verify the verification code for an email
  *     tags: [Auth]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               email:
  *                 type: string
  *                 example: user@example.com
  *               providedCode:
  *                 type: string
  *                 example: 123456
  *     responses:
  *       200:
  *         description: Verification successful
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 success:
  *                   type: boolean
  *                 message:
  *                   type: string
  *                 data:
  *                   type: array
  *                   items:
  *                     type: object
  *                 statusCode:
  *                   type: integer
  *       400:
  *         description: Verification failed
  *       500:
  *         description: Internal Server Error
  */
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


    /**
     * @swagger
     * /auth/change-password:
     *   post:
     *     summary: Change the user's password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password changed successfully
     */
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

    /**
 * @swagger
 * /auth/send-forgot-password-code:
 *   post:
 *     summary: Send a forgot password code to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Forgot password code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 statusCode:
 *                   type: integer
 *       400:
 *         description: Failed to send forgot password code
 *       500:
 *         description: Internal Server Error
 */
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


    /**
     * @swagger
     * /auth/verify-forgot-password-code:
     *   post:
     *     summary: Verify the forgot password code and reset password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               providedCode:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password reset successful
     */
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
