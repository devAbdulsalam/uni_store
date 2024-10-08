import pool from '../db.js';
import Order from '../models/Order.js';

export const getOrders = async (req, res) => {
	try {
		let orders;
		if (req.user.role === 'ADMIN') {
			orders = await Order.find();
		} else {
			orders = await Order.find({ userId: req.user.id });
		}

		// Fetch product details for each order
		const orderDetails = await Promise.all(
			orders.map(async (order) => {
				const productResult = await pool.query(
					'SELECT id, name, price FROM product WHERE id = $1',
					[order.product_id]
				);
				const productImage = await pool.query(
					'SELECT url FROM product_image WHERE product_id = $1',
					[order.product_id]
				);
				const product = {
					...productResult.rows[0],
					image: productImage.rows[0].url,
				};
				return {
					...order,
					product,
				};
			})
		);

		res.json(orderDetails);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const singleOrder = await Order.findById(id);
		if (!singleOrder) {
			return res.status(404).json({ message: 'Order not found' });
		}
		const order = singleOrder.rows[0];
		const product = await pool.query('SELECT * FROM product WHERE id = $1', [
			order.product_id,
		]);
		const productImage = await pool.query(
			'SELECT url FROM product_image WHERE product_id = $1',
			[order.product_id]
		);

		const user = await pool.query(
			'SELECT id, username, phone, email, role FROM users WHERE id = $1',
			[order.user_id]
		);

		const avatar = await pool.query(
			'SELECT url FROM avatar WHERE user_id = $1',
			[order.user_id]
		);
		res.json({
			...order,
			product: { ...product.rows[0], image: productImage.rows[0]?.url },
			user: { ...user.rows[0], avatar: avatar.rows[0]?.url },
		});
	} catch (err) {
		console.log('error +++++++++++', err);
		res.status(500).send(err.message);
	}
};

export const createOrder = async (req, res) => {
	const {
		user_id = req.user.id,
		product_id,
		quantity,
		total,
		status = 'PENDING',
	} = req.body;

	try {
		// Check if the product exists and has enough quantity
		const productResult = await pool.query(
			'SELECT * FROM product WHERE id = $1',
			[product_id]
		);
		const product = productResult.rows[0];

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		if (product.quantity < quantity) {
			return res
				.status(400)
				.json({ message: 'Not enough product quantity available' });
		}

		// Update the product quantity
		const newQuantity = product.quantity - quantity;
		await pool.query('UPDATE product SET quantity = $1 WHERE id = $2', [
			newQuantity,
			product_id,
		]);

		// Insert the new order
		const result = await Order.create({
			userId: user_id,
			product_id,
			quantity,
			total,
			status,
		});

		res.json(result);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const createOrders = async (req, res) => {
	const orders = req.body; // Assuming req.body is an array of orders
	try {
		const results = [];
		for (const ord of orders) {
			const result = await pool.query(
				'INSERT INTO orders (user_id, product_id, quantity, total) VALUES ($1, $2, $3, $4) RETURNING *',
				[ord.user_id, ord.product_id, ord.quantity, ord.total]
			);
			results.push(result.rows[0]);
		}
		res.json({ results, message: 'Order success' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const updateOrder = async (req, res) => {
	const { id } = req.params;
	// const fields = [];
	// const values = [];
	// let query = 'UPDATE orders SET ';

	// Object.keys(req.body).forEach((key, index) => {
	// 	fields.push(`${key} = $${index + 1}`);
	// 	values.push(req.body[key]);
	// });

	// query +=
	// 	fields.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *';
	// values.push(id);

	try {
		const updatedOrder = await Order.findByIdAndUpdate({ id }, { ...req.body });
		if (!updatedOrder) {
			return res.status(404).json({ message: 'Order not found' });
		}
		res.json(updatedOrder);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const deleteOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const deleteOrder = await pool.query('DELETE FROM orders WHERE id = $1', [
			id,
		]);
		res.json({ message: 'Order deleted succesylly' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};
