import express from 'express';
import {
	register,
	login,
	passwordRecovery,
	getUsers,
	getAdmins,
	getUser,
	deleteUser,
	getProfile,
	getRefreshtoken,
	updateUser,
	changePassword,
	updateAvatar,
} from '../controllers/users.js';
import auth from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';
const router = express.Router();

router.get('/', getUsers);
router.get('/admins', getAdmins);
router.get('/profile', auth, getProfile);
router.get('/:id', getUser);
router.post('/change-password', auth, changePassword);
router.post('/register', register);
router.post('/refresh-token', getRefreshtoken);
router.post('/login', login);
router.post('/forgot-password', passwordRecovery);
router.post('/password-recovery', passwordRecovery);
router.patch('/avatar', auth, upload.single('avatar'), updateAvatar);
router.patch('/:id', auth, upload.single('file'), updateUser);
router.put('/profile', auth, upload.single('file'), updateUser);
router.delete('/:id', deleteUser);

export default router;
