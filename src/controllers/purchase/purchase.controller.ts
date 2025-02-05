import { Request, Response } from 'express';
import { purchaseService } from './purchase.service';

class PurchaseController {

    // Create a new purchase
    async createPurchase(req: Request, res: Response) {
        try {
            const newPurchase = await purchaseService.createPurchase(req.body);
            res.json({
                statusCode: 201,
                message: 'Order placed successfully!',
                data: newPurchase,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Purchase failed!',
                status: false,
            });
        }
    }

    // Get purchase by ID
    async getPurchaseById(req: Request, res: Response) {
        try {
            const purchase = await purchaseService.getPurchaseById(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Purchase fetched successfully',
                data: purchase.purchase,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 404,
                message: error.message || 'Purchase not found',
                status: false,
            });
        }
    }

    // Get all purchases with optional filters
    async getPurchases(req: Request, res: Response) {
        const { page = 1, limit = 10, sort = '{}' } = req.query;
        try {
            const purchases = await purchaseService.getPurchases({}, Number(page), Number(limit), JSON.parse(sort as string));
            res.json({
                statusCode: 200,
                message: 'Purchases fetched successfully',
                data: purchases.purchases,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Error fetching purchases',
                status: false,
            });
        }
    }

    // Update a purchase by ID
    async updatePurchase(req: Request, res: Response) {
        try {
            const updatedPurchase = await purchaseService.updatePurchase(req.params.id, req.body);
            res.json({
                statusCode: 200,
                message: 'Purchase updated successfully',
                data: updatedPurchase,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Purchase update failed',
                status: false,
            });
        }
    }

    // Delete a purchase by ID
    async deletePurchase(req: Request, res: Response) {
        try {
            const deletedPurchase = await purchaseService.deletePurchase(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Purchase deleted successfully',
                data: deletedPurchase,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 404,
                message: error.message || 'Purchase not found',
                status: false,
            });
        }
    }

}

export const purchaseController = new PurchaseController();