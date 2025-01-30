import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import path from 'path';
import authRoute from './controllers/auth/auth.route';
import productRoute from './controllers/product/product.route';
import reviewRoute from './controllers/reviews/reviews.route';
import purchaseRoute from './controllers/purchase/purchase.routes';
import addressRoute from './controllers/address/address.routes';
import connectDB from './dbConnection';

const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./templates"));

// Middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

//routes for all the controllers
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/review', reviewRoute);
app.use('/purchase', purchaseRoute);
app.use('/address', addressRoute);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello there, Greeting from the server!' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App running on PORT: ${PORT}`);
});
