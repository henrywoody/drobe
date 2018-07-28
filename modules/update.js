const	query = require('./query'),
		tableIsAllowed = require('./table-is-allowed'),
		cleanArticleData = require('./clean-article-data');
		dataToSQL = require('./data-to-sql-format'),
		camelCaseKeys = require('./camel-case-keys');

async function tableByIdWithValues(table, id, data) {
	if (!tableIsAllowed(table))
		return null;

	cleanData = cleanArticleData(table, data);

	const { columns, queryValueSQLVars, queryValues } = dataToSQL(cleanData);
	const idSQLVar = queryValues.length + 1;
	const queryText = `UPDATE ${table}
						SET (${columns}) = (${queryValueSQLVars})
						WHERE id = $${idSQLVar}
						RETURNING *`;
	const updateResult = await query(queryText, [...queryValues, id]);

	const { rows } = updateResult;
	if (!rows) {
		const { name, constraint } = updateResult;
		if (name === 'error') {
			let err;
			if (constraint === 'dress_name_owner_id_key') {
				err = new Error('Name is taken');
				err.name = 'ValidationError';
			} else {
				err = new Error('Server Error');
				err.name = 'ServerError';
			}
			throw err;
		}
	} else {
		return camelCaseKeys(rows[0]);
	}
}

module.exports = {
	tableByIdWithValues: tableByIdWithValues
}