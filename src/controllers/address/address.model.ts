import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required!'],
    },
    name: {
        type: String,
        required: [true, 'Name is required for particular address!'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required!'],
        trim: true,
    },
    houseNo: {
        type: String,
        required: [true, 'House number is required!'],
        trim: true,
    },
    buildingOrSociety: {
        type: String,
        required: [true, 'Building or society name is required!'],
        trim: true,
    },
    street: {
        type: String,
        required: [true, 'Stree is required!'],
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        required: [true, 'City is required!'],
        trim: true,
    },
    taluka: {
        type: String,
        required: [true, 'Taluka is required!'],
        trim: true,
    },
    district: {
        type: String,
        required: [true, 'District is required!'],
        trim: true,
    },
    state: {
        type: String,
        required: [true, 'State is required!'],
        trim: true,
    },
    country: {
        type: String,
        required: [true, 'Country is required!'],
        trim: true,
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required!'],
        trim: true,
        match: [/^\d{5,6}$/, 'Pincode must be a valid 5 or 6-digit number!'],
    },
}, {
    timestamps: true,
});

const Address = mongoose.model("Addresses", addressSchema);

export default Address;
