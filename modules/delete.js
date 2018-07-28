const	query = require('./query'),
		tableIsAllowed = require('./table-is-allowed');

async function fromTableById(table, id) {
	if (!tableIsAllowed(table))
		return null;

	const queryText = `DELETE FROM ${table} * WHERE id = $1`;
	const queryValues = [id];
	await query(queryText, queryValues);
}

module.exports = {
	fromTableById: fromTableById
}