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
                const error = {
                    message: 'Product not found!',
                    status: 500,
                }
                next(error);
            }

            const newReview = await reviewService.createReview(reviewData);
            res.status(201).json({
                statusCode: 201,
                message: 'Review created successfully!',
                data: newReview,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to add review!',
                status: 400,
            }
            next(error);
        }
    }

    // Get all reviews for a product
    async getProductReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const reviews = await reviewService.getProductReviews(productId);

            res.status(200).json({
                statusCode: 200,
                message: 'Reviews retrieved successfully',
                data: reviews.reviews || [],
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to fetch reviews!',
                status: 500,
            }
            next(error);
        }
    }

    // Update a review
    async updateReview(req: any, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const updateData = req.body;
            const userId = req.user._id;

            const updatedReview = await reviewService.updateReview(reviewId, updateData, userId);

            if (!updatedReview) {
                const error = {
                    message: 'Review not found!',
                    status: 404,
                }
                next(error);
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Review updated successfully!',
                data: updatedReview,
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to modify the review!',
                status: 400,
            }
            next(error);
        }
    }

    // Delete a review
    async deleteReview(req: any, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;

            const deletedReview = await reviewService.deleteReview(reviewId);

            if (!deletedReview) {
                const error = {
                    message: 'Review not found!',
                    status: 400,
                }
                next(error);
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Review deleted successfully!',
                status: true,
            });
        } catch (err: any) {
            const error = {
                message: 'Failed to delete review!',
                status: 400,
            }
            next(error);
        }
    }
}

export const reviewController = new ReviewController();
