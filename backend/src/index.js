import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.listen(3030, () => console.log('Server is running on port 3030'));

//Database connection
import mongoose from 'mongoose';
mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(() => console.log('Error connecting to MongoDB:'));

import cookieParser from 'cookie-parser';
import cors from 'cors';
app.use(cookieParser());
app.use(cors({
    origin: process.env.DOMAIN,
    credentials: true,
}));



// app level middleware
import morgan from 'morgan';
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//route level middleware
import userRouter from './user/user.routes.js';
import TransactionRouter from './transaction/transaction.route.js';
import DashboardRouter from './dashboard/dashboard.route.js';
import SettingsRouter from './settings/settings.route.js';
app.use("/api/user", userRouter);
app.use("/api/transaction", TransactionRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/settings", SettingsRouter);