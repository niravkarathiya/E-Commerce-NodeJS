import { NextFunction, Request, Response } from 'express';
import { cartService } from './cart.service';

class CartController {

    // Get cart details
    async getCartDetails(req: Request, res: Response) {
        const { userId } = req.params;

        try {
            const result = await cartService.getCartDetails(userId);
            res.status(result.statusCode || 200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addToCart(req: Request, res: Response, next: NextFunction) {
        const { userId, productId, quantity } = req.body;
        try {
            const result = await cartService.addToCart(userId, productId, quantity);
            res.status(201).json({
                statusCode: 201,
                message: result.message,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.message || 'Failed to add product to cart!',
                status: 400,
            };
            next(error);
        }
    }

    async removeFromCart(req: Request, res: Response, next: NextFunction) {
        const { userId, productId, quantity } = req.body;
        try {
            const result = await cartService.removeFromCart(userId, productId, quantity);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.message || 'Failed to remove product from cart!',
                status: 400,
            };
            next(error);
        }
    }

    async emptyCart(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;
        try {
            const result = await cartService.emptyCart(userId);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.message || 'Failed to empty cart!',
                status: 400,
            };
            next(error);
        }
    }
}

export const cartController = new CartController();