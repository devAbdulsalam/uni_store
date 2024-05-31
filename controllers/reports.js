import pool from '../db.js';

export const getDashboard = async (req, res) => {
	try {
		// Query to get total number of products
		const totalProductsResult = await pool.query(
			'SELECT COUNT(*) AS total FROM product'
		);
		const totalProducts = totalProductsResult.rows[0].total;
		// get 10 recent products
		const recentProducts = await pool.query(
			'SELECT * FROM product ORDER BY created_at DESC LIMIT 10'
		);
		const productImages = await pool.query('SELECT * FROM product_image');

		// Loop through products and add image URL based on matching ID
		const productsWithImages = recentProducts.rows.map((product) => {
			const matchingImage = productImages.rows.find(
				(image) => image.product_id === product.id
			);

			return {
				...product, // Spread existing product properties
				image: matchingImage ? matchingImage.url : null, // Add image URL if found, otherwise null
			};
		});
		// Query to get total number of users
		const totalUsersResult = await pool.query(
			'SELECT COUNT(*) AS total FROM users'
		);
		const totalUsers = totalUsersResult.rows[0].total;

		// Query to get total number of orders
		const totalOrdersResult = await pool.query(
			'SELECT COUNT(*) AS total FROM order'
		);
		const totalOrders = totalOrdersResult.rows[0].total;

		// Construct the response object
		const data = {
			totalProducts,
			totalUsers,
			totalOrders,
			products: productsWithImages,
		};

		// Send the response
		res.json(data);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getSalesReports = async (req, res) => {
	try {
		const salesReports = await pool.query(
			'SELECT order_date::date, SUM(total) as total_sales FROM order GROUP BY order_date::date'
		);
		res.json(salesReports.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getInventoryReports = async (req, res) => {
	try {
		const inventoryReports = await pool.query(
			'SELECT product_id, quantity FROM inventory'
		);
		res.json(inventoryReports.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
