const	query = require('./query'),
		tableIsAllowed = require('./table-is-allowed'),
		camelCaseKeys = require('./camel-case-keys');

async function fromTableByUser(table, userId) {
	if (!tableIsAllowed(table))
		return null;
	const queryText = `SELECT * FROM ${table} WHERE owner_id = $1`;
	const queryValues = [userId];
	const { rows } = await query(queryText, queryValues);
	return rows.map(e => {
		return camelCaseKeys(e);
	});
}

async function fromTableById(table, id) {
	if (!tableIsAllowed(table))
		return null;
	const queryText = `SELECT * FROM ${table} WHERE id = $1`;
	const queryValues = [id];
	const { rows } = await query(queryText, queryValues);
	if (rows.length)
		return camelCaseKeys(rows[0]);
	return null;
}


module.exports = {
	fromTableByUser: fromTableByUser,
	fromTableById: fromTableById
};