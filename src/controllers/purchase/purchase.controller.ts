import { NextFunction, Request, Response } from 'express';
import { purchaseService } from './purchase.service';

class PurchaseController {

    // Create a new purchase
    async createPurchase(req: Request, res: Response, next: NextFunction) {
        try {
            const newPurchase = await purchaseService.createPurchase(req.body);
            res.json({
                statusCode: 201,
                message: 'Order placed successfully!',
                data: newPurchase,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to purchase product!',
                status: 400,
            }
            next(error);
        }
    }

    // Get purchase by ID
    async getPurchaseById(req: Request, res: Response, next: NextFunction) {
        try {
            const purchase = await purchaseService.getPurchaseById(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Purchase fetched successfully',
                data: purchase.purchase,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Order not found!',
                status: 404,
            }
            next(error);
        }
    }

    // Get all purchases with optional filters
    async getPurchases(req: Request, res: Response, next: NextFunction) {
        const { page = 1, limit = 10, sort = '{}' } = req.query;
        try {
            const purchases = await purchaseService.getPurchases({}, Number(page), Number(limit), JSON.parse(sort as string));
            res.json({
                statusCode: 200,
                message: 'Purchases fetched successfully',
                data: purchases.purchases,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Filed to fetch orders!',
                status: 400,
            }
            next(error);
        }
    }

    // Update a purchase by ID
    async updatePurchase(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedPurchase = await purchaseService.updatePurchase(req.params.id, req.body);
            res.json({
                statusCode: 200,
                message: 'Purchase updated successfully',
                data: updatedPurchase,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to modify order!',
                status: 400,
            }
            next(error);
        }
    }

    // Delete a purchase by ID
    async deletePurchase(req: Request, res: Response, next: NextFunction) {
        try {
            const deletedPurchase = await purchaseService.deletePurchase(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Purchase deleted successfully',
                data: deletedPurchase,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Order not found!',
                status: 500,
            }
            next(error);
        }
    }

}

export const purchaseController = new PurchaseController();