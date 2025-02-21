import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ConatctRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration
app.use(cors({
    origin: process.env.ORIGIN,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

// Serve static files correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/files", express.static(path.join(__dirname, "uploads/files")));



app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

setupSocket(server)

// MongoDB Connection
mongoose.connect(databaseURL).then(() => {
    console.log("Database connected successfully");
}).catch((err) => {
    console.error("Database connection error:", err.message);
});
