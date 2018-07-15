const pg = require('pg');

global.config = require('../config')[process.env.NODE_ENV];

const pgConfig = {
	user: global.config.dbUser,
	password: global.config.dbPassword,
	database: global.config.dbName,
	host: global.config.dbHost,
	port: 5432
};

const pool = new pg.Pool(pgConfig);


module.exports = async (queryText, queryValues) => {
	try {
		const client = await pool.connect();
		try {
			const result = await client.query(queryText, queryValues);
			client.release();
			return { result, rows: result.rows };
		} catch (err) {
			console.log(err)
			return err;
		}
	} catch (err) {
		console.log(err)
		return err;
	}
}