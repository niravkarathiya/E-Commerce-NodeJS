// controllers/product.controller.ts
import { NextFunction, Request, Response } from 'express';
import { productService } from './product.service';


class ProductController {


    async createProduct(req: any, res: Response, next: NextFunction) {

        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json({
                statusCode: 201,
                message: 'Product created successfully',
                data: newProduct,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.errors[0].message || 'Product creation failed!',
                status: 400,
            }
            next(error);
        }
    }


    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = req.query.filter;
            const page = req.query.page || 0;
            const sort = req.query.sort;
            const products = await productService.getProducts(filters, page, sort);
            res.status(200).json({
                statusCode: 200,
                message: 'Products retrieved successfully',
                data: products.products || [],
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: err.errors[0].message || 'Failed to getting products!',
                status: 500,
            }
            next(error);
        }
    }


    async getProductById(req: Request, res: Response, next: NextFunction) {
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
        } catch (err: any) {
            const error = {
                message: 'Failed to getting product!',
                status: 500,
            }
            next(error);
        }
    }


    async updateProduct(req: Request, res: Response, next: NextFunction) {
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
        } catch (err: any) {
            const error = {
                message: 'Failed to modify product!',
                status: 500,
            }
            next(error);
        }
    }


    async deleteProduct(req: Request, res: Response, next: NextFunction) {
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
        } catch (err: any) {
            const error = {
                message: 'Failed to delete product!',
                status: 500,
            }
            next(error);
        }
    }
}

export const productController = new ProductController();
