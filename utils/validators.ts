import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({ tlds: { allow: ['com'] } }),
    password: Joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});

export const loginSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({ tlds: { allow: ['com'] } }),
    password: Joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});

export const verificationCodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] },
    }),
    providedCode: Joi.number().required(),
});

export const changePasswordSchema = Joi.object({
    newPassword: Joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
    oldPassword: Joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});

export const verifyForgotPasswordSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ['com', 'net'] },
    }),
    providedCode: Joi.string().required(),
    newPassword: Joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});
