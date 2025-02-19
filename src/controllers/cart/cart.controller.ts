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

    async updateCart(req: Request, res: Response, next: NextFunction) {
        const { userId, productId, quantity, mode } = req.body;
        try {
            const result = await cartService.updateCart(userId, productId, quantity, mode);
            res.status(201).json({
                statusCode: 201,
                message: result.message,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.message || 'Failed to update cart!',
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

    // Delete a single product from cart
    async deleteProductFromCart(req: any, res: Response, next: NextFunction) {
        const userId = req.user._id;
        const { productId } = req.params;

        try {
            if (!productId) {
                res.status(400).json({ error: 'Product ID is required!' });
            }

            const result = await cartService.deleteProductFromCart(userId, productId);
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

}

export const cartController = new CartController();