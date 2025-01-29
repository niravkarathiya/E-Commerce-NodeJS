import mongoose from 'mongoose';

const { Schema } = mongoose;

const reviewSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: [true, 'Product reference is required!'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, 'User reference is required!'],
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required!'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'Review title is required!'],
        minLength: [3, 'Title must have at least 3 characters!'],
    },
    reviewText: {
        type: String,
        required: [true, 'Review text is required!'],
        trim: true,
        minLength: [10, 'Review text must have at least 10 characters!'],
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false,
    },
    images: [
        {
            url: {
                type: String,
                required: [true, 'Image URL is required!'],
                trim: true,
            },
            altText: {
                type: String,
                trim: true,
            }
        }
    ],
    status: {
        type: String,
        enum: ['approved', 'pending', 'flagged'],
        default: 'pending',
    }
}, {
    timestamps: true,
});

const Review = mongoose.model("Reviews", reviewSchema);

export default Review;
