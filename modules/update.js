const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		cleanArticleData = require('./clean-article-data');
		dataToSQL = require('./data-to-sql-format'),
		camelCaseKeys = require('./camel-case-keys'),
		separateNestedFields = require('./separate-nested-fields'),
		getAllJoins = require('./get-all-joins'),
		join = require('./join'),
		unjoin = require('./unjoin'),
		select = require('./select');

async function tableByIdWithValues(table, id, data) {
	checkTableIsAllowed(table);

	nestedCleanData = cleanArticleData(table, data);
	const {cleanData, nestedData} = separateNestedFields(nestedCleanData);

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
			if (constraint === 'dress_name_user_id_key') {
				err = new Error('Name is taken');
				err.name = 'ValidationError';
			} else {
				err = new Error('Server Error');
				err.name = 'ServerError';
			}
			throw err;
		}
	} else {
		const existingJoins = await getAllJoins.forTableById(table, id);
		for (const otherTable in existingJoins) {
			const joinsToRemove = existingJoins[otherTable].filter(e => !nestedData[otherTable].includes(e));
			await unjoin.tableByIdToMany(table, id, {[otherTable]: joinsToRemove});

			const joinsToAdd = nestedData[otherTable].filter(e => !existingJoins[otherTable].includes(e));
			await join.tableByIdToMany(table, id, {[otherTable]: joinsToAdd});
		}
		
		return select.fromTableByIdWithJoins(table, id);
	}
}

module.exports = {
	tableByIdWithValues: tableByIdWithValues
}