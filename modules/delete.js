const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed');

async function fromTableById(table, id) {
	checkTableIsAllowed(table);

	const queryText = `DELETE FROM ${table} * WHERE id = $1`;
	const queryValues = [id];
	await query(queryText, queryValues);
}

module.exports = {
	fromTableById: fromTableById
}