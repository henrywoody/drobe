const	query = require('./query'),
		cleanUserData = require('./clean-user-data');
		dataToSQL = require('./data-to-sql-format'),
		camelCaseKeys = require('./camel-case-keys');

module.exports = async (id, data, {includePassword=false}={}) => {
	cleanData = cleanUserData(data);

	if (!includePassword)
		delete cleanData.password;

	const { columns, queryValueSQLVars, queryValues } = dataToSQL(cleanData);
	const idSQLVar = queryValues.length + 1;
	const queryText = `UPDATE app_user
						SET (${columns}) = (${queryValueSQLVars})
						WHERE id = $${idSQLVar}
						RETURNING *`;
	const updateResult = await query(queryText, [...queryValues, id]);

	const { rows } = updateResult;
	if (!rows) {
		const { name, constraint } = updateResult;
		if (name === 'error' && constraint === 'app_user_username_key') {
			const err = new Error;
			err.name = 'UserExistsError';
			throw err;
		}
	} else {
		return camelCaseKeys(rows[0]);
	}
}