const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		cleanArticleData = require('./clean-article-data'),
		dataToSQL = require('./data-to-sql-format'),
		camelCaseKeys = require('./camel-case-keys');

async function intoTableValues (table, data) {
	checkTableIsAllowed(table);

	cleanData = cleanArticleData(table, data);
	
	const { columns, queryValueSQLVars, queryValues } = dataToSQL(cleanData);
	const queryText = `INSERT INTO ${table}(${columns}) VALUES(${queryValueSQLVars}) RETURNING *`;
	const insertResult = await query(queryText, queryValues);

	const { rows } = insertResult;
	if (!rows) {
		const { name, constraint, column, routine } = insertResult;
		if (name === 'error') {
			let err;
			if (constraint === 'shirt_name_owner_id_key') {
				err = new Error('Name is taken.');
			} else if (column === 'name') {
				err = new Error('Name cannot be empty.');
			} else if (constraint === 'article_rating_check') {
				err = new Error('Rating cannot be below 1 or exceed 5.');
			} else if (routine === 'enum_in') {
				err = new Error('Invalid value.');
			}
			err.name = 'ValidationError';
			throw err;
		}
	} else {
		return camelCaseKeys(rows[0]);
	}
}

module.exports = {
	intoTableValues: intoTableValues
};