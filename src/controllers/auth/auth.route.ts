// routes/auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller';
import { loggedIn } from '../../middlewares/auth.middleware';

const authRouter = Router();

// Register route
authRouter.post('/register', authController.register);

// Login route
authRouter.post('/login', authController.login);

//Sending code for verification
authRouter.patch('/send-verification-code', loggedIn, authController.sendVerificationCode);

//Verifying code that been sent to email address for verification
authRouter.patch('/verify-verification-code', loggedIn, authController.verifyVerificationCode);

//Changing password
authRouter.patch('/change-password', loggedIn, authController.changePassword);

// Sending the code to email address for forgot password
authRouter.patch('/send-forgot-password-code', authController.sendForgotCode);

// Verifying the that been sent to the email address for forgot password
authRouter.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);

//log out if user is already logged in
authRouter.post('sign-out', loggedIn, authController.signOut);

export default authRouter;
