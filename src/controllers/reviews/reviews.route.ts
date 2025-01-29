// routes/reviews.routes.ts
import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth.middleware';
import { reviewController } from './reviews.controller';

const reviewRoute = Router();

// Create a new review for a product
reviewRoute.post('/:productId', loggedIn, reviewController.createReview);

// Get all reviews for a product
reviewRoute.get('/:productId', reviewController.getProductReviews);

// Update a review (only by the review owner)
reviewRoute.patch('/:reviewId', loggedIn, reviewController.updateReview);

// Delete a review (only by the review owner or admin)
reviewRoute.delete('/:reviewId', loggedIn, reviewController.deleteReview);

export default reviewRoute;
