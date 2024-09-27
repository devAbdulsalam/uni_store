import bcrypt from 'bcryptjs';
import pool from '../db.js'; // Assuming a db.js file for database connection
import dotenv from 'dotenv';
import { createToken, createRefreshToken } from '../utils/tokens.js';
import jwt from 'jsonwebtoken';
import { uploader } from '../utils/cloudinary.js';
import fs from 'fs';

dotenv.config();

export const register = async (req, res) => {
	const { username, password, email, phone, role = 'USER' } = req.body;
	try {
		const emailexist = await pool.query(
			`SELECT EXISTS (SELECT * FROM users WHERE email = $1)`,
			[email]
		);
		if (emailexist.rows[0].exists) {
			return res
				.status(409)
				.json({ message: 'email already in use by another user' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await pool.query(
			'INSERT INTO users (username, phone, password, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[username, phone, hashedPassword, email, role]
		);
		res.json(newUser.rows[0]);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// login with email or username
export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		console.log({ email, password });
		const user = await pool.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		if (user.rows.length === 0)
			return res.status(400).json({ message: 'Username or password is wrong' });

		const validPass = await bcrypt.compare(password, user.rows[0].password);
		if (!validPass)
			return res.status(400).json({ message: 'Invalid password' });

		const userId = user.rows[0].id;
		const token = await createToken({
			id: userId,
			role: user.rows[0].role,
		});
		const refreshToken = await createRefreshToken({
			id: userId,
		});
		const userInfo = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE id = $1',
			[userId]
		);
		const avatar = await pool.query(
			'SELECT url FROM avatar WHERE user_id = $1',
			[userId]
		);
		res.header('Authorization', token).json({
			token,
			refreshToken,
			user: { ...userInfo.rows[0], avatar: avatar.rows[0]?.url },
		});
	} catch (err) {
		console.log(err);
		res.status(500).json(err.message);
	}
};
export const getProfile = async (req, res) => {
	const { id } = req.user;
	try {
		const user = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE id = $1',
			[id]
		);
		if (user.rows.length === 0) {
			return res.status(400).json({ message: 'Username or password is wrong' });
		}

		res.status(200).json(user.rows[0]);
	} catch (err) {
		console.log(err);
		res.status(500).json(err.message);
	}
};
export const loginWithUsernameOrEmail = async (req, res) => {
	const { identifier, password } = req.body; // 'identifier' can be either username or email
	try {
		// Query to check both username and email
		const user = await pool.query(
			'SELECT * FROM users WHERE username = $1 OR email = $1',
			[identifier]
		);

		if (user.rows.length === 0)
			return res
				.status(400)
				.json({ message: 'Username or email is incorrect' });

		const validPass = await bcrypt.compare(password, user.rows[0].password);
		if (!validPass)
			return res.status(400).json({ message: 'Invalid password' });

		const token = await createToken({
			id: user.rows[0].id,
			role: user.rows[0].role,
		});
		const refreshToken = await createRefreshToken({
			id: user.rows[0].id,
		});

		const userInfo = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE email = $1',
			[email]
		);
		res
			.header('Authorization', token)
			.send({ token, refreshToken, user: userInfo });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const getRefreshtoken = async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(401).json({ message: 'Invalid refresh token' });
		}
		const decodedToken = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET
		);

		// console.log('decodedToken.id,', decodedToken);
		const user = await pool.query('SELECT * FROM users WHERE id = $1', [
			decodedToken.id,
		]);
		if (user.rows.length === 0) {
			return res.status(401).json({ message: 'Invalid refresh token' });
		}
		const token = await createToken({
			id: user.rows[0].id,
			role: user.rows[0].role,
		});

		const refreshTokn = await createRefreshToken({
			id: user.rows[0].id,
		});

		res
			.header('Authorization', token)
			.send({ token, refreshToken: refreshTokn });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE email = $1',
			[email]
		);
		if (user.rows.length === 0) {
			return res
				.status(400)
				.json({ message: 'if email exist you will receive a message!' });
		}
		const token = await createToken({
			id: user.rows[0].id,
		});
		res.status(200).json({
			link: `${process.env.API_URL}/users/reset-password/${token}`,
			token,
			message: 'Password recovery link and token sent',
		});
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
};
export const passwordReset = async (req, res) => {
	try {
		const { token } = req.params;
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		const userId = verified.id;
		const password = '123456';
		const hashedPassword = await bcrypt.hash(password, 10);
		const updatedUser = await pool.query(
			'UPDATE users SET password = $1 WHERE id = $2',
			[hashedPassword, userId]
		);
		const user = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE id = $1',
			[userId]
		);
		if (user.rows.length === 0) {
			return res
				.status(400)
				.json({ message: 'if email exist you will receive a message!' });
		}
		res.status(200).json({
			user: user.rows[0],
			message: 'Password updated succefully',
		});
	} catch (error) {
		res.status(400).json({ message: 'Invalid Token' });
		// res.status(500).send(error.message);
	}
};
// get user minus there passwords and avatar fro each user
export const getUsers = async (req, res) => {
	try {
		const allUsers = await pool.query(
			'SELECT id, username, email, phone, role FROM users'
		); // Select desired columns
		const avatars = await pool.query('SELECT * FROM avatar');
		const usersWithImages = allUsers.rows.map((user) => {
			const matchingImage = avatars.rows.find(
				(image) => image.user_id === user.id
			);
			return {
				...user, // Spread existing user properties
				avatar: matchingImage ? matchingImage.url : null, // Add image URL if found, otherwise null
			};
		});
		res.json(usersWithImages);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
export const getAdmins = async (req, res) => {
	try {
		const users = await pool.query(
			`
			SELECT  u.id, u.username, u.email, u.phone, u.role,
				(SELECT ROW_TO_JSON(avatar_obj) FROM (
				SELECT * FROM avatar WHERE user_id = u.id 
			) avatar_obj) AS avatar			
			FROM users u
			WHERE role = $1`,
			['ADMIN']
		);
		// const avatars = await pool.query();
		// const usersWithImages = users.rows.map((user) => {
		// 	const matchingImage = avatars.rows.find(
		// 		(image) => image.user_id === user.id
		// 	);
		// 	return {
		// 		...user, // Spread existing user properties
		// 		avatar: matchingImage ? matchingImage.url : null, // Add image URL if found, otherwise null
		// 	};
		// });
		// res.json(usersWithImages);
		res.json(users.rows);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// export const getAdmins = async (req, res) => {
// 	try {
// 		const users = await pool.query(
// 			'SELECT  id, username, email, phone, role FROM users WHERE role = $1',
// 			['ADMIN']
// 		);
// 		const avatars = await pool.query('SELECT * FROM avatar');
// 		const usersWithImages = users.rows.map((user) => {
// 			const matchingImage = avatars.rows.find(
// 				(image) => image.user_id === user.id
// 			);
// 			return {
// 				...user, // Spread existing user properties
// 				avatar: matchingImage ? matchingImage.url : null, // Add image URL if found, otherwise null
// 			};
// 		});
// 		res.json(usersWithImages);
// 	} catch (err) {
// 		res.status(500).send(err.message);
// 	}
// };
export const getUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE id = $1',
			[id]
		);
		const avatar = await pool.query('SELECT * FROM avatar WHERE id = $1', [id]);

		res.json({ ...user.rows[0], avatar: avatar.rows[0]?.url });
	} catch (err) {
		res.status(500).send(err.message);
	}
};

export const updateAvatar = async (req, res) => {
	const { id } = req.user;
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No Avatar file uploaded!' });
		}
		const image = await uploader(req.file.path, 'avatar');
		if (!image) {
			await fs.promises.unlink(req.file.path);
			return res.status(400).json({ message: 'Avatar file uploaded error!' });
		}

		// Save the product image in the database
		const { public_id, url } = image;
		const avatarImage = await pool.query(
			'INSERT INTO avatar (user_id, public_id, url) VALUES ($1, $2, $3) RETURNING *',
			[id, public_id, url]
		);
		const user = await pool.query(
			'SELECT id, username, email, phone, role FROM users WHERE id = $1',
			[id]
		);
		await fs.promises.unlink(req.file.path);
		const avatar = avatarImage.rows[0];
		res.status(200).json({
			...user.rows[0],
			avatar: avatar.url,
		});
	} catch (err) {
		console.log(err);
		if (!req.file) {
			await fs.promises.unlink(req.file.path);
		}
		res.status(500).json(err.message);
	}
};
export const changePassword = async (req, res) => {
	const { id } = req.user;
	const { newPassword } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const user = await pool.query(
			'UPDATE users SET password = $1 WHERE id = $2',
			[hashedPassword, id]
		);
		// console.log('user', user);
		if (user.rows.length === 0) {
			return res.status(400).json({ message: 'Username or password is wrong' });
		}
		res.status(200).json(user.rows[0]);
	} catch (err) {
		console.log(err);
		res.status(500).json(err.message);
	}
};

export const updateUser = async (req, res) => {
	try {
		const { id } = req.user || req.params;
		const { username, email, phone } = req.body;
		const user = await pool.query(
			'UPDATE users SET username = $1, email = $2,  phone = $3 WHERE id = $4 RETURNING *',
			[username, email, phone, id]
		);
		const avatar = await pool.query(
			'SELECT url FROM avatar WHERE user_id = $1',
			[id]
		);

		res.json({ ...user.rows[0], avatar: avatar.rows[0]?.url });
	} catch (err) {
		console.log(err);
		res.status(500).send(err.message);
	}
};

export const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedUser = await pool.query('DELETE FROM users WHERE id = $1', [
			id,
		]);
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};
