import Joi from 'joi';

// Helper function to generate error messages for string fields
const generateStringMessages = (field: string, min: number, max: number) => ({
    'string.base': `${field} must be a string.`,
    'string.min': `${field} should have a minimum length of ${min} characters.`,
    'string.max': `${field} should have a maximum length of ${max} characters.`,
    'any.required': `${field} is required.`,
});

// Price validation with error messages
const priceValidation = Joi.number()
    .required()
    .min(0)
    .messages({
        'number.base': 'Price must be a number.',
        'number.min': 'Price cannot be negative.',
        'any.required': 'Price is required.',
    });

// Stock validation with error messages
const stockValidation = Joi.number()
    .required()
    .min(0)
    .messages({
        'number.base': 'Stock must be a number.',
        'number.min': 'Stock cannot be negative.',
        'any.required': 'Stock quantity is required.',
    });

// Image validation for product images
const imageSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        'string.base': 'Image URL must be a string.',
        'string.uri': 'Image URL must be a valid URI.',
        'any.required': 'Image URL is required.',
    }),
    altText: Joi.string().allow('').messages({
        'string.base': 'Alt text must be a string.',
    }),
});

// Rating validation
const ratingValidation = Joi.number()
    .min(0)
    .max(5)
    .messages({
        'number.base': 'Rating must be a number.',
        'number.min': 'Rating must be at least 0.',
        'number.max': 'Rating cannot exceed 5.',
    });

export const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages(generateStringMessages('Product name', 3, 100)),
    description: Joi.string().min(10).max(500).required().messages(generateStringMessages('Product description', 10, 500)),
    price: priceValidation,
    category: Joi.string().min(3).max(50).required().messages(generateStringMessages('Category', 3, 50)),
    stock: stockValidation,
    brand: Joi.string().min(2).max(50).optional().messages(generateStringMessages('Brand', 2, 50)),
    images: Joi.array().items(imageSchema).min(1).messages({
        'array.min': 'At least one image is required.',
    }),
    rating: ratingValidation,
    isFeatured: Joi.boolean().optional().messages({
        'boolean.base': 'isFeatured must be a boolean value.',
    }),
});
