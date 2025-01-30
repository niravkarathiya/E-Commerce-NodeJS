import { randomController } from '../../utils/generateRandom';
import Address from '../address/address.model';
import Product from '../product/product.model';
import Purchase from './purchase.model';

class PurchaseService {

    // Create a new purchase
    async createPurchase(data: any) {
        try {
            const newPurchase = new Purchase(data);
            newPurchase.orderNumber = randomController.generateUnique11DigitNumber();
            newPurchase.trackingNumber = randomController.generateALBUniqueTrackingNumber();
            newPurchase.invoiceNumber = randomController.generateALBUniqueInvoiceNumber();

            for (let i = 0; i < newPurchase.products.length; i++) {
                const product = newPurchase.products[i];
                const existingProduct = await Product.findById(product.productId).select('price');
                product.unitPrice = existingProduct?.price ?? 0;
                product.total = product.quantity * product.unitPrice;
            }

            newPurchase.totalPrice = newPurchase.products.reduce((sum, product) => {
                return sum + (product.total ?? 0);
            }, 0);

            const shippingAddress = await Address.findById(newPurchase.shippingAddress).select('_id');
            if (shippingAddress) {
                newPurchase.shippingAddress = shippingAddress._id;
            }

            const billingAddress = await Address.findById(newPurchase.billingAddress).select('_id');
            if (billingAddress) {
                newPurchase.billingAddress = billingAddress._id;
            }

            await newPurchase.save();
            return { message: 'Purchase created successfully!', purchase: newPurchase };
        } catch (error: any) {
            throw new Error(`Error creating purchase: ${error.message}`);
        }
    }

    // Fetch a single purchase by ID
    async getPurchaseById(purchaseId: any) {
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            throw new Error('Purchase not found!');
        }
        return { purchase };
    }

    // Fetch all purchases with optional filters, pagination, and sorting
    async getPurchases(filters = {}, page = 1, limit = 10, sort = {}) {
        try {
            const purchases = await Purchase.find(filters)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sort);

            const totalCount = await Purchase.countDocuments(filters);
            return {
                purchases,
                totalCount,
                page,
                totalPages: Math.ceil(totalCount / limit)
            };
        } catch (error: any) {
            throw new Error(`Error fetching purchases: ${error.message}`);
        }
    }

    // Update purchase by ID
    async updatePurchase(purchaseId: any, updateData: any) {
        try {
            const updatedPurchase = await Purchase.findByIdAndUpdate(purchaseId, updateData, {
                new: true,
                runValidators: true
            });

            if (!updatedPurchase) {
                throw new Error('Purchase not found!');
            }

            return { message: 'Purchase updated successfully!', purchase: updatedPurchase };
        } catch (error: any) {
            throw new Error(`Error updating purchase: ${error.message}`);
        }
    }

    // Delete purchase by ID
    async deletePurchase(purchaseId: any) {
        try {
            const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
            if (!deletedPurchase) {
                throw new Error('Purchase not found!');
            }
            return { message: 'Purchase deleted successfully!', purchase: deletedPurchase };
        } catch (error: any) {
            throw new Error(`Error deleting purchase: ${error.message}`);
        }
    }

}

export const purchaseService = new PurchaseService();
