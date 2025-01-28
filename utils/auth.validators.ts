import Joi from 'joi';

// Helper function to generate error messages for string fields
const generateStringMessages = (field: string, min: number, max: number) => ({
    'string.base': `${field} must be a string.`,
    'string.min': `${field} should have a minimum length of ${min} characters.`,
    'string.max': `${field} should have a maximum length of ${max} characters.`,
    'string.email': `Please provide a valid ${field.toLowerCase()}.`,
    'any.required': `${field} is required.`,
});

// Password validation pattern and messages
const passwordValidation = Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
        'string.base': 'Password must be a string.',
        'string.pattern.base':
            'Password must contain at least one lowercase letter, one uppercase letter, and one digit, with a minimum length of 8 characters.',
        'any.required': 'Password is required.',
    });

// Helper function for email validation
const generateEmailValidation = (tlds: string[] = ['com']) =>
    Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({ tlds: { allow: tlds } })
        .messages(generateStringMessages('Email', 6, 60));

// Helper function for code validation
const generateCodeValidation = (type: 'string' | 'number') =>
    type === 'number'
        ? Joi.number().required().messages({
            'number.base': 'Verification code must be a number.',
            'any.required': 'Verification code is required.',
        })
        : Joi.string().required().messages({
            'string.base': 'Verification code must be a string.',
            'any.required': 'Verification code is required.',
        });

// Validation schemas
export const registerSchema = Joi.object({
    email: generateEmailValidation(['com']),
    password: passwordValidation,
});

export const loginSchema = Joi.object({
    email: generateEmailValidation(['com']),
    password: passwordValidation,
});

export const verificationCodeSchema = Joi.object({
    email: generateEmailValidation(['com', 'net']),
    providedCode: generateCodeValidation('number'),
});

export const changePasswordSchema = Joi.object({
    newPassword: passwordValidation,
    oldPassword: passwordValidation,
});

export const verifyForgotPasswordSchema = Joi.object({
    email: generateEmailValidation(['com', 'net']),
    providedCode: generateCodeValidation('string'),
    newPassword: passwordValidation,
});
