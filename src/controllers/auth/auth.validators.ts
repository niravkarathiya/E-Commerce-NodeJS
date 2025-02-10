import Joi, { number } from 'joi';

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
    .trim()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
        'string.base': 'Password must be a string.',
        'string.pattern.base':
            'Password must contain at least one lowercase letter, one uppercase letter, and one digit, with a minimum length of 8 characters.',
        'any.required': 'Password is required.',
    });

// Helper function for email validation
const generateEmailValidation = (tlds = ['com']) =>
    Joi.string()
        .min(6)
        .max(60)
        .required()
        .trim()
        .email({ tlds: { allow: tlds } })
        .messages(generateStringMessages('Email', 6, 60));

// Helper function for code validation
const generateCodeValidation = (type: string) =>
    type === 'number'
        ? Joi.number().required().messages({
            'number.base': 'Verification code must be a number.',
            'any.required': 'Verification code is required.',
        })
        : Joi.string().required().messages({
            'string.base': 'Verification code must be a string.',
            'any.required': 'Verification code is required.',
        });

const avatarValidation = Joi.string().uri().messages({
    'string.uri': 'Avatar must be a valid URI.',
});

const usernameValidation = Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username must be a string.',
    'string.min': 'Username should have at least 3 characters.',
    'string.max': 'Username should not exceed 30 characters.',
    'any.required': 'Username is required.',
});

const roleValidation = Joi.string().valid('admin', 'user', 'vendor').required().messages({
    'any.only': 'Role must be one of admin, user, or vendor.',
    'any.required': 'Role is required.',
});

// Validation schemas
export const registerSchema = Joi.object({
    email: generateEmailValidation(['com']),
    password: passwordValidation,
    username: usernameValidation,
    avatar: avatarValidation,
    role: roleValidation,
});

export const loginSchema = Joi.object({
    email: generateEmailValidation(['com']),
    password: passwordValidation,
});

export const verificationCodeSchema = Joi.object({
    email: generateEmailValidation(['com', 'net']),
    providedCode: generateCodeValidation('string'),
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

export const updateUserSchema = Joi.object({
    username: usernameValidation.optional(),
    avatar: avatarValidation.optional(),
    role: roleValidation.optional(),
    verified: Joi.boolean().messages({
        'boolean.base': 'Verified must be a boolean value.',
    }).optional(),
    refreshToken: Joi.string().optional(),
});
