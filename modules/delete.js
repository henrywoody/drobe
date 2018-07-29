const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		unjoin = require('./unjoin');

async function fromTableById(table, id) {
	checkTableIsAllowed(table);

	await unjoin.allForTableById(table, id);
	const queryText = `DELETE FROM ${table} * WHERE id = $1`;
	const queryValues = [id];
	await query(queryText, queryValues);
}

module.exports = {
	fromTableById: fromTableById
}