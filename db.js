import pg from 'pg';
const { Pool } = pg;

import dotenv from 'dotenv';

dotenv.config();


console.log('database', process.env.DATABASE_URL);
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
		
pool.connect((err) => {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log('Connect to PostgreSQL successfully!');
});

export default pool;
