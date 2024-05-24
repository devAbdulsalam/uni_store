import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reportRoutes from './routes/reports.js';
// import setupRoutes from './routes/setup.js';

const app = express();
app.use(bodyParser.json());

// console.log('hello');
app.use(cors());
app.use('/welcome', (req, res) => {
	res.status(200).json({ message: 'Welcome to unistore api' });
});
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/reports', reportRoutes);

// app.use('/setup', setupRoutes);

app.use('/', (req, res) => {
	res.status(200).json({ message: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
