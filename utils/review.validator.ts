import Joi from 'joi';

// Helper for generating error messages for string fields
const generateStringMessages = (field: string, min: number, max: number) => ({
    'string.base': `${field} must be a string.`,
    'string.min': `${field} should have a minimum length of ${min} characters.`,
    'string.max': `${field} should have a maximum length of ${max} characters.`,
    'any.required': `${field} is required.`,
});

// Image validation for review images
const reviewImageSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image URL must be a valid URI.',
        'any.required': 'Image URL is required.',
    }),
    altText: Joi.string().allow('').messages({
        'string.base': 'Alt text must be a string.',
    }),
});

// Review schema validation
export const reviewSchema = Joi.object({
    product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid Product ID format.',
        'any.required': 'Product reference is required.',
    }),
    user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid User ID format.',
        'any.required': 'User reference is required.',
    }),
    rating: Joi.number().min(1).max(5).required().messages({
        'number.base': 'Rating must be a number.',
        'number.min': 'Rating must be at least 1.',
        'number.max': 'Rating cannot exceed 5.',
        'any.required': 'Rating is required.',
    }),
    title: Joi.string().min(3).max(100).required().messages(generateStringMessages('Review title', 3, 100)),
    reviewText: Joi.string().min(10).max(500).required().messages(generateStringMessages('Review text', 10, 500)),
    isVerifiedPurchase: Joi.boolean().optional().messages({
        'boolean.base': 'isVerifiedPurchase must be a boolean value.',
    }),
    images: Joi.array().items(reviewImageSchema).min(0).messages({
        'array.min': 'Images must be an array.',
    }),
    status: Joi.string().valid('approved', 'pending', 'flagged').optional().messages({
        'string.base': 'Status must be a string.',
        'any.only': 'Status must be one of approved, pending, or flagged.',
    }),
});
