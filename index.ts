import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userRouter } from "./routes/user";
import cors from 'cors';
 // Import dotenv

require('dotenv').config(); 

const app = express();
const prisma = new PrismaClient();

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 5000 || 3000;

app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`ag server listening on ${PORT}`)    
})
