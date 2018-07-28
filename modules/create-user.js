const	query = require('./query'),
		cleanUserData = require('./clean-user-data'),
		camelCaseKeys = require('./camel-case-keys'),
		dataToSQL = require('./data-to-sql-format');

module.exports = async (data) => {
	cleanData = cleanUserData(data);
	
	const { columns, queryValueSQLVars, queryValues } = dataToSQL(cleanData);
	const queryText = `INSERT INTO app_user(${columns}) VALUES(${queryValueSQLVars}) RETURNING *`;
	const insertResult = await query(queryText, queryValues);

	const { rows } = insertResult;
	if (!rows) {
		const { name, constraint } = insertResult;
		if (name === 'error' && constraint === 'app_user_username_key') {
			const err = new Error;
			err.name = 'UserExistsError';
			throw err;
		}
	} else {
		return camelCaseKeys(rows[0]);
	}
}