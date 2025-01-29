import { Request, Response, NextFunction } from 'express';
import { productService } from '../product/product.service'; // For product existence check
import { reviewService } from './review.service';

class ReviewController {

    // Create a new review
    async createReview(req: any, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const reviewData = {
                ...req.body,
                product: productId,
                user: req.user._id
            };

            // Check if the product exists
            const productExists = await productService.getProductById(productId);
            if (!productExists) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Product not found!',
                    status: false,
                });
            }

            const newReview = await reviewService.createReview(reviewData);
            res.status(201).json({
                statusCode: 201,
                message: 'Review created successfully!',
                data: newReview,
                status: true,
            });
        } catch (error: any) {
            res.status(500).json({
                statusCode: 500,
                message: error.message || 'Failed to create review!',
                status: false,
            });
        }
    }

    // Get all reviews for a product
    async getProductReviews(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const reviews = await reviewService.getProductReviews(productId);

            res.status(200).json({
                statusCode: 200,
                message: 'Reviews retrieved successfully',
                data: reviews.reviews || [],
                status: true,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Failed to fetch reviews!',
                status: false,
            });
        }
    }

    // Update a review
    async updateReview(req: any, res: Response) {
        try {
            const { reviewId } = req.params;
            const updateData = req.body;
            const userId = req.user._id;

            const updatedReview = await reviewService.updateReview(reviewId, updateData, userId);

            if (!updatedReview) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Review not found or unauthorized!',
                    status: false,
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Review updated successfully!',
                data: updatedReview,
                status: true,
            });
        } catch (error: any) {
            res.status(400).json({
                statusCode: 400,
                message: error.message || 'Failed to update review!',
                status: false,
            });
        }
    }

    // Delete a review
    async deleteReview(req: any, res: Response) {
        try {
            const { reviewId } = req.params;

            const deletedReview = await reviewService.deleteReview(reviewId);

            if (!deletedReview) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Review not found or unauthorized!',
                    status: false,
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Review deleted successfully!',
                status: true,
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Failed to delete review!',
                status: false,
            });
        }
    }
}

export const reviewController = new ReviewController();
