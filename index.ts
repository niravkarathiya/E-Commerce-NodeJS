import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth/auth.route';
import { engine } from 'express-handlebars';
import path from 'path';

const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./templates"));

// Middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.DB_URI as string).then(() => {
    console.log('Database connected successfully!');
}).catch(err => {
    console.error('ERROR:', err);
});

app.use('/auth', authRoute);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello there, Greeting from the server!' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App running on PORT: ${PORT}`);
});
