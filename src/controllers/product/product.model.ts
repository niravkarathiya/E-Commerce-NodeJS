import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required!'],
        trim: true,
        minLength: [3, 'Product name must have at least 3 characters!'],
    },
    description: {
        type: String,
        required: [true, 'Product description is required!'],
        trim: true,
        minLength: [10, 'Description must have at least 10 characters!'],
    },
    price: {
        type: Number,
        required: [true, 'Product price is required!'],
        min: [0, 'Price must be a positive number!'],
    },
    category: {
        type: String,
        required: [true, 'Product category is required!'],
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required!'],
        min: [0, 'Stock must be a positive number or zero!'],
    },
    brand: {
        type: String,
        trim: true,
    },
    images: [
        {
            url: {
                type: String,
                required: [true, 'Image is required!'],
                trim: true,
            },
            altText: {
                type: String,
                trim: true,
            }
        }
    ],
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating must be at most 5'],
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model("Products", productSchema);

export default Product;
