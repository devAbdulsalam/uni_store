import mongoose, { Schema } from 'mongoose';

const OrderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			default: '',
		},
		product_id: {
			type: String,
			default: '',
		},
		name: {
			type: String,
			default: '',
		},
		quantity: {
			type: Number,
			default: 0,
		},
		total: {
			type: Number,
			default: 0,
		},
		date: {
			type: Date,
			default: Date.now, // Set to current date by default
		},
		status: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
