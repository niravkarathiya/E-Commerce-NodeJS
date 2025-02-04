import mongoose from 'mongoose';

const { Schema } = mongoose;


const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        unique: [true, 'Email already exists!'],
        minLength: [5, 'Email must have 5 characters!'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
        trim: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeValidation: {
        type: Number,
    },
    forgotPasswordCode: {
        type: String,
    },
    forgotPasswordCodeValidation: {
        type: Number,
    },
    avatar: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        required: [true, "User name is required!"],
        trim: true,
        lowercase: true,
    }
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
