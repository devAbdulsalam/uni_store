import express from 'express';
import {
	getCategory,
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from '../controllers/category.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get('/', auth, getCategories);
router.get('/:id', auth, getCategory);
router.post('/', auth, createCategory);
router.patch('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router;
