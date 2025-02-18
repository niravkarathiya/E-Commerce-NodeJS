import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required!'],
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: [true, 'Product ID is required!'],
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required!'],
                min: [1, 'Quantity must be at least 1!'],
            }
        }
    ],
}, {
    timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
