import Review from "./reviews.model";
import { reviewSchema } from "./review.validator";

class ReviewService {

    // Create a new review
    async createReview(reviewData: any) {
        const { error } = reviewSchema.validate(reviewData);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const newReview = new Review(reviewData);
        await newReview.save();
        return { message: "Review created successfully!", review: newReview };
    }

    // Fetch reviews for a specific product
    async getProductReviews(productId: string) {
        const reviews = await Review.find({ product: productId });

        if (!reviews || reviews.length === 0) {
            return { message: "No reviews found for this product." };
        }

        return { reviews };
    }

    // Update a review by review ID and user ID
    async updateReview(reviewId: string, updateData: any, userId: string) {
        const { error } = reviewSchema.validate(updateData, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }

        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId, user: userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            throw new Error("Review not found or user not authorized to update.");
        }

        return { message: "Review updated successfully!", review: updatedReview };
    }

    // Delete a review by review ID and user ID (allowing admin deletion)
    async deleteReview(reviewId: string) {

        const deletedReview = await Review.findOneAndDelete({ _id: reviewId });

        if (!deletedReview) {
            throw new Error("Review not found!.");
        }

        return { message: "Review deleted successfully!", review: deletedReview };
    }
}

export const reviewService = new ReviewService();
