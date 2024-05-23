import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const auth = (req, res, next) => {
	// verify user is authenticated
	const { authorization } = req.headers;
	if (!authorization) {
		return res.status(401).json({ message: 'Authorization token required' });
	}
	const token = authorization.split(' ')[1] || authorization;

	if (!token) return res.status(401).json({ message: 'Access Denied' });

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).json({ message: 'Invalid Token' });
	}
};

export default auth;
