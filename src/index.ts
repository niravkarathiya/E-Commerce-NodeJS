// environment access configuration
import dotenv from 'dotenv';
dotenv.config();

//libraries imports
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import path from 'path';

//controller imports
import authRoute from './controllers/auth/auth.route';
import productRoute from './controllers/product/product.route';
import reviewRoute from './controllers/reviews/reviews.route';
import purchaseRoute from './controllers/purchase/purchase.routes';
import addressRoute from './controllers/address/address.routes';
import fs from "fs";

//database connection
import connectDB from './dbConnection';

const app = express();

//set view engine for the handlebars and configuration
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./templates"));

// Middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log request details
app.use((req, res, next) => {
    const dateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    const logMessage = `[${dateTime}] - IP: ${ipAddress} - ${req.method} ${req.originalUrl}\n`;

    // Log to the log file
    fs.appendFile(path.join(__dirname, 'log.txt'), logMessage, (err) => {
        if (err) {
            console.error("Error writing to log file", err);
        }
    });

    next();
});

// Database connection
connectDB();

//routes for all the controllers
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/review', reviewRoute);
app.use('/purchase', purchaseRoute);
app.use('/address', addressRoute);

// starter page 
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello there, Greeting from the server!' });
});

// Start server and port setup
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App running on PORT: ${PORT}`);
});
