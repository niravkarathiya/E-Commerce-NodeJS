import Joi from 'joi';

// Joi validation schema for Address
const generateStringMessages = (field: string, min: number, max: number) => ({
    'string.base': `${field} must be a string.`,
    'string.min': `${field} should have a minimum length of ${min} characters.`,
    'string.max': `${field} should have a maximum length of ${max} characters.`,
    'any.required': `${field} is required.`,
});

export const addressValidationSchema = Joi.object({
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.base': 'User ID must be a string.',
        'string.pattern.base': 'User ID must be a valid ObjectId.',
        'any.required': 'User ID is required.',
    }),
    houseNo: Joi.string().min(1).max(50).required().messages(generateStringMessages('House number', 1, 50)),
    buildingOrSociety: Joi.string().min(3).max(100).required().messages(generateStringMessages('Building or society name', 3, 100)),
    street: Joi.string().allow('').messages({
        'string.base': 'Street must be a string.',
    }),
    landmark: Joi.string().allow('').max(255).messages({
        'string.base': 'Landmark must be a string.',
        'string.max': 'Landmark should have a maximum length of 255 characters.',
    }),
    city: Joi.string().min(2).max(100).required().messages(generateStringMessages('City', 2, 100)),
    taluka: Joi.string().min(2).max(100).required().messages(generateStringMessages('Taluka', 2, 100)),
    district: Joi.string().min(2).max(100).required().messages(generateStringMessages('District', 2, 100)),
    state: Joi.string().min(2).max(100).required().messages(generateStringMessages('State', 2, 100)),
    country: Joi.string().min(2).max(100).required().messages(generateStringMessages('Country', 2, 100)),
    pincode: Joi.string().pattern(/^\d{5,6}$/).required().messages({
        'string.base': 'Pincode must be a string.',
        'string.pattern.base': 'Pincode must be a valid 5 or 6-digit number.',
        'any.required': 'Pincode is required.',
    }),
});