import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DB_URI as string);
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit the process with a failure code
    }
};

export default connectDB;
