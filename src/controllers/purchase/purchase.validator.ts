import Joi from 'joi';

// Helper function to generate error messages for string fields
const generateStringMessages = (field: string, min: number, max: number) => ({
    'string.base': `${field} must be a string.`,
    'string.min': `${field} should have a minimum length of ${min} characters.`,
    'string.max': `${field} should have a maximum length of ${max} characters.`,
    'any.required': `${field} is required.`,
});

// User ID validation
const userIdValidation = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.base': 'User ID must be a string.',
    'string.pattern.base': 'User ID must be a valid.',
    'any.required': 'User ID is required.',
});

// Order number validation
const orderNumberValidation = Joi.string().min(3).max(50).required().messages(generateStringMessages('Order number', 3, 50));

// Product validation for products array
const productValidation = Joi.object({
    productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.base': 'Product ID must be a string.',
        'string.pattern.base': 'Product ID must be a valid.',
        'any.required': 'Product ID is required.',
    }),
    quantity: Joi.number().min(1).required().messages({
        'number.base': 'Quantity must be a number.',
        'number.min': 'Quantity must be at least 1.',
        'any.required': 'Quantity is required.',
    }),
    unitPrice: Joi.number().min(0).required().messages({
        'number.base': 'Unit price must be a number.',
        'number.min': 'Unit price must be a positive number.',
        'any.required': 'Unit price is required.',
    }),
});

// Total price validation
const totalPriceValidation = Joi.number().min(0).required().messages({
    'number.base': 'Total price must be a number.',
    'number.min': 'Total price must be a positive number.',
    'any.required': 'Total price is required.',
});

// Payment method validation
const paymentMethodValidation = Joi.string().valid('Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery').required().messages({
    'string.base': 'Payment method must be a string.',
    'any.required': 'Payment method is required.',
    'any.only': 'Payment method must be one of "Credit Card", "Debit Card", "PayPal", or "Cash on Delivery".',
});

// Payment status validation
const paymentStatusValidation = Joi.string().valid('Paid', 'Pending', 'Failed', 'Refunded').required().messages({
    'string.base': 'Payment status must be a string.',
    'any.required': 'Payment status is required.',
    'any.only': 'Payment status must be one of "Paid", "Pending", "Failed", or "Refunded".',
});

// Shipping and billing address validation
const addressValidation = Joi.string().min(5).max(255).required().messages(generateStringMessages('Address', 5, 255));

// Order status validation
const orderStatusValidation = Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled').required().messages({
    'string.base': 'Order status must be a string.',
    'any.required': 'Order status is required.',
    'any.only': 'Order status must be one of "Pending", "Processing", "Shipped", "Delivered", or "Canceled".',
});

// Tax and discount amount validation
const taxDiscountValidation = Joi.number().min(0).messages({
    'number.base': 'Tax/Discount amount must be a number.',
    'number.min': 'Tax/Discount amount must be a positive number or zero.',
});

export const purchaseSchema = Joi.object({
    userId: userIdValidation,
    orderNumber: orderNumberValidation,
    products: Joi.array().items(productValidation).min(1).required().messages({
        'array.base': 'Products must be an array.',
        'array.min': 'At least one product is required.',
        'any.required': 'Products are required.',
    }),
    totalPrice: totalPriceValidation,
    paymentMethod: paymentMethodValidation,
    paymentStatus: paymentStatusValidation,
    shippingAddress: addressValidation,
    billingAddress: addressValidation,
    orderStatus: orderStatusValidation,
    trackingNumber: Joi.string().allow('').messages({
        'string.base': 'Tracking number must be a string.',
    }),
    deliveryDate: Joi.date().optional().messages({
        'date.base': 'Delivery date must be a valid date.',
    }),
    taxAmount: taxDiscountValidation.optional(),
    discountAmount: taxDiscountValidation.optional(),
    invoiceNumber: Joi.string().allow('').messages({
        'string.base': 'Invoice number must be a string.',
    }),
    notes: Joi.string().allow('').messages({
        'string.base': 'Notes must be a string.',
    }),
});
