import mongoose from 'mongoose';

const { Schema } = mongoose;

const purchaseSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'User ID is required!'],
    },
    orderNumber: {
        type: String,
        unique: true,
        trim: true,
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
            },
            unitPrice: {
                type: Number,
                min: [0, 'Unit price must be a positive number!'],
            },
            total: {
                type: Number,
                min: [0, 'Unit price must be a positive number!'],
            }
        }
    ],
    totalPrice: {
        type: Number,
        min: [0, 'Total price must be a positive number!'],
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required!'],
        enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
    },
    paymentStatus: {
        type: String,
        required: [true, 'Payment status is required!'],
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: [true, 'Shipping address is required!'],
    },
    billingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: [true, 'Billing address is required!'],
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Canceled'],
        default: 'Processing',
    },
    trackingNumber: {
        type: String,
        trim: true,
    },
    deliveryDate: {
        type: Date,
    },
    taxAmount: {
        type: Number,
        min: [0, 'Tax amount must be a positive number or zero!'],
    },
    discountAmount: {
        type: Number,
        min: [0, 'Discount amount must be a positive number or zero!'],
    },
    invoiceNumber: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

const Purchase = mongoose.model("Purchases", purchaseSchema);

export default Purchase;
