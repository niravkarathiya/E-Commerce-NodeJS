// controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { productService } from '../../services/product/product.service';


class ProductController {


    async createProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json({
                statusCode: 201,
                message: 'Product created successfully',
                data: newProduct,
                status: true,
            });
        } catch (error: any) {
            res.status(400).json({
                statusCode: 400,
                message: error.message || 'Product creation failed',
                status: false,
            });
        }
    }


    async getProducts(req: Request, res: Response) {
        try {
            const products = await productService.getProducts();
            res.status(200).json({
                statusCode: 200,
                message: 'Products retrieved successfully',
                data: products.products || [],
                status: true,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Failed to retrieve products',
                status: false,
            });
        }
    }


    async getProductById(req: Request, res: Response) {
        const { productId } = req.params;
        try {
            const product = await productService.getProductById(productId);
            if (!product) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Product not found',
                    status: false,
                });
            }
            res.status(200).json({
                statusCode: 200,
                message: 'Product retrieved successfully',
                data: product,
                status: true,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Failed to retrieve product',
                status: false,
            });
        }
    }


    async updateProduct(req: Request, res: Response) {
        const { productId } = req.params;
        try {
            const updatedProduct = await productService.updateProduct(productId, req.body);
            if (!updatedProduct) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Product not found',
                    status: false,
                });
            }
            res.status(200).json({
                statusCode: 200,
                message: 'Product updated successfully',
                data: updatedProduct,
                status: true,
            });
        } catch (error: any) {
            res.status(400).json({
                statusCode: 400,
                message: error.message || 'Product update failed',
                status: false,
            });
        }
    }


    async deleteProduct(req: Request, res: Response) {
        const { productId } = req.params;
        try {
            const deletedProduct = await productService.deleteProduct(productId);
            if (!deletedProduct) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Product not found',
                    status: false,
                });
            }
            res.status(200).json({
                statusCode: 200,
                message: 'Product deleted successfully',
                status: true,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Failed to delete product',
                status: false,
            });
        }
    }
}

export const productController = new ProductController();
