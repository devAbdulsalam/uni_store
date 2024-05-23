import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const createToken = async (data) => {
	return jwt.sign(data, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};
export const createRefreshToken = async (data) => {
	return jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.JWT_REFRESH_EXPIRE,
	});
};
