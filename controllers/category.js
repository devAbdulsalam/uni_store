import pool from '../db.js';

export const getCategories = async (req, res) => {
	try {
		const Categories = await pool.query('SELECT * FROM category');
		res.json(Categories.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const getCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await pool.query('SELECT * FROM category WHERE id = $1', [
			id,
		]);
		if (!category.rows[0]) {
			return res.status(404).json({ message: 'Product category not found' });
		}
		res.json(category.rows[0]);
	} catch (err) {
		console.log('error +++++++++++', err);
		res.status(500).send(err.message);
	}
};

export const createCategory = async (req, res) => {
	const { name } = req.body;

	try {
		// Check if the product exists and has enough quantity
		const category = await pool.query(
			'SELECT EXISTS (SELECT * FROM category WHERE name = $1)',
			[name]
		);
		const checkCategory = category.rows[0].exists;

		if (checkCategory) {
			return res
				.status(409)
				.json({ message: 'Category with name already exist!' });
		}

		// Insert the new Category
		const result = await pool.query(
			'INSERT INTO category (name) VALUES ($1) RETURNING *',
			[name]
		);
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const updateCategory = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	try {
		const updatedCategory = await pool.query(
			'UPDATE category SET name = $1 WHERE id = $2 RETURNING *',
			[name, id]
		);
		res.json(updatedCategory.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			'SELECT COUNT(*) FROM product WHERE category_id = $1',
			[id]
		);
		if (result.rows[0].count > 0) {
			return res
				.status(409)
				.json({ message: `Category has ${result.rows[0].count} product(s)` });
		}
		const deleteCategory = await pool.query(
			'DELETE FROM category WHERE id = $1',
			[id]
		);
		if (deleteCategory.rowCount == 0) {
			return res.status(409).json({ message: 'Category not found' });
		}
		res.status(200).json({ message: 'Category deleted successfully' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};
