import pool from '../db.js';
import fs from 'fs';
import { uploader } from '../utils/cloudinary.js';

// export const getProducts = async (req, res) => {
// 	try {
// 		const all_products = await pool.query('SELECT * FROM products');
// 		const product_images = await pool.query('SELECT * FROM product_images');

// 		res.json({
// 			products: {
// 				all_products: all_products.rows,
// 				product_images: product_images.rows,
// 			},
// 		});
// 	} catch (err) {
// 		res.status(500).send(err.message);
// 	}
// };
export const getProducts = async (req, res) => {
	try {
		const allProducts = await pool.query('SELECT * FROM products');
		const productImages = await pool.query('SELECT * FROM product_images');

		// Loop through products and add image URL based on matching ID
		const productsWithImages = allProducts.rows.map((product) => {
			const matchingImage = productImages.rows.find(
				(image) => image.product_id === product.id
			);

			return {
				...product, // Spread existing product properties
				image: matchingImage ? matchingImage.url : null, // Add image URL if found, otherwise null
			};
		});

		res.json({
			products: productsWithImages,
		});
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const product = await pool.query('SELECT * FROM products WHERE id = $1', [
			id,
		]);
		if (!product) {
			res.status(401).send({ message: 'Product not found' });
		}
		const productImage = await pool.query(
			'SELECT * FROM product_images WHERE product_id = $1',
			[id]
		);
		res.json({ ...product.rows[0], image: productImage.rows[0]?.url });
	} catch (err) {
		res.status(500).send(err.message);
	}
};

// Search products with query, sort, and pagination
export const searchProducts = async (req, res) => {
	const { query, sort, page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	try {
		// Build the search query
		let searchQuery = 'SELECT * FROM products WHERE 1=1';
		const values = [];

		if (query) {
			searchQuery += ' AND (name ILIKE $1 OR description ILIKE $1)';
			values.push(`%${query}%`);
		}

		if (sort) {
			const [sortField, sortOrder] = sort.split(':');
			searchQuery += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
		} else {
			searchQuery += ' ORDER BY id ASC';
		}

		searchQuery += ' LIMIT $2 OFFSET $3';
		values.push(limit, offset);

		const products = await pool.query(searchQuery, values);
		const productsWithDetails = await Promise.all(
			products.rows.map(async (product) => {
				const subcategories = await pool.query(
					'SELECT s.name FROM subcategories s INNER JOIN product_subcategories ps ON s.id = ps.subcategory_id WHERE ps.product_id = $1',
					[product.id]
				);
				return {
					...product,
					image: {
						url: product.image_url,
						publicid: product.image_public_id,
					},
					subcategory: subcategories.rows.map((row) => row.name),
				};
			})
		);

		// Get the total count for pagination
		let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
		if (query) {
			countQuery += ' AND (name ILIKE $1 OR description ILIKE $1)';
		}
		const countResult = await pool.query(countQuery, values.slice(0, 1));
		const totalCount = parseInt(countResult.rows[0].count, 10);

		res.json({
			products: productsWithDetails,
			pagination: {
				total: totalCount,
				page: parseInt(page, 10),
				limit: parseInt(limit, 10),
			},
		});
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// post product details
export const createProduct = async (req, res) => {
	const { name, description, price, quantity } = req.body;
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No product file uploaded!' });
		}
		const image = await uploader(req.file.path, 'product');
		if (!image) {
			await fs.promises.unlink(req.file.path);
			return res.status(400).json({ message: 'Product file uploaded error!' });
		}
		const newProduct = await pool.query(
			'INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
			[name, description, price, quantity]
		);
		const productId = newProduct.rows[0].id;

		// Save the product image in the database
		const { public_id, url } = image;
		const productImage = await pool.query(
			'INSERT INTO product_images (product_id, public_id, url) VALUES ($1, $2, $3) RETURNING *',
			[productId, public_id, url]
		);

		res.json({
			newProduct: {
				...newProduct.rows[0],
				image: productImage.rows[0].url,
			},
		});
	} catch (err) {
		if (!req.file) {
			await fs.promises.unlink(req.file.path);
		}
		res.status(500).send(err.message);
	}
};

// Update product details
export const updateProduct = async (req, res) => {
	const { id } = req.params;
	const { name, description, price, quantity } = req.body;
	try {
		const updatedProduct = await pool.query(
			'UPDATE products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *',
			[name, description, price, quantity, id]
		);
		res.json(updatedProduct.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

// Update product price
export const updateProductPrice = async (req, res) => {
	const { id } = req.params;
	const { price } = req.body;
	try {
		const updatedProduct = await pool.query(
			'UPDATE products SET price = $1 WHERE id = $2 RETURNING *',
			[price, id]
		);
		res.json(updatedProduct.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

// Add image to product
export const addProductImage = async (req, res) => {
	const { id } = req.params;
	const { image_url } = req.body;
	try {
		const updatedProduct = await pool.query(
			'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING *',
			[image_url, id]
		);
		res.json(updatedProduct.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// delete product details
export const deleteProduct = async (req, res) => {
	const { id } = req.params;
	try {
		const deleteProduct = await pool.query(
			'DELETE FROM products WHERE id = $1',
			[id]
		);
		res.json({ message: 'product deleted succefully' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// delete products details
export const deleteProducts = async (req, res) => {
	try {
		const deleteProducts = await pool.query('DELETE FROM products');
		res.json({ message: 'products deleted successfully' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};
