const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		cleanArticleData = require('./clean-article-data'),
		dataToSQL = require('./data-to-sql-format'),
		camelCaseKeys = require('./camel-case-keys'),
		separateNestedFields = require('./separate-nested-fields'),
		join = require('./join'),
		select = require('./select');

async function intoTableValues (table, data) {
	checkTableIsAllowed(table);

	nestedCleanData = cleanArticleData(table, data);
	const {cleanData, nestedData} = separateNestedFields(nestedCleanData);
	
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
		const newId = rows[0].id;
		await join.tableByIdToMany(table, newId, nestedData);
		return select.fromTableByIdWithJoins(table, newId);
	}
}

module.exports = {
	intoTableValues: intoTableValues
};