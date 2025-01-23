import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';

export const loggedIn = (req: any, res: any, next: NextFunction) => {
    try {
        let token: string | undefined;

        if (req.headers.client === 'not-browser') {
            token = req.headers.authorization; // From authorization header
        } else {
            token = req.cookies['Authorization']; // From cookies
        }

        if (!token) {
            return res.status(403).json({ success: false, message: 'Unauthorized!' });
        }

        const userToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

        const verifiedJWT = jwt.verify(userToken, process.env.TOKEN_SECRET as string);

        if (verifiedJWT) {
            req.user = verifiedJWT;
            return next();
        }

        throw new Error('Invalid token!');
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ success: false, message: 'Unauthorized!' });
    }
};
