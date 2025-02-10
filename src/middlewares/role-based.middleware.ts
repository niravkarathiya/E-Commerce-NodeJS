import jwt from 'jsonwebtoken';

export const isAdmin = (req: any, res: any, next: any) => {
    try {
        let token: string | undefined = req.headers.authorization;

        if (!token) {
            return res.status(403).json({ success: false, message: 'Unauthorized!' });
        }

        const userToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

        const verifiedJWT = jwt.verify(userToken, process.env.TOKEN_SECRET as string);

        if (verifiedJWT) {
            req.user = verifiedJWT;

            if (req.user.role === 'admin') {
                return next();
            }

            return res.status(403).json({ success: false, message: 'Access forbidden: Admins only!' });
        }

        throw new Error('Invalid token!');
    } catch (error: any) {
        return res.status(403).json({ success: false, message: error.message || 'Forbidden!' });
    }
};
