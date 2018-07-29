const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		camelCaseKeys = require('./camel-case-keys');

async function fromTableByUser(table, userId) {
	checkTableIsAllowed(table);
	
	const queryText = `SELECT * FROM ${table} WHERE owner_id = $1`;
	const queryValues = [userId];
	const { rows } = await query(queryText, queryValues);
	return rows.map(e => {
		return camelCaseKeys(e);
	});
}

async function fromTableById(table, id) {
	checkTableIsAllowed(table);

	const queryText = `SELECT * FROM ${table} WHERE id = $1`;
	const queryValues = [id];
	const { rows } = await query(queryText, queryValues);
	if (rows.length)
		return camelCaseKeys(rows[0]);
	
	const err = new Error(`${table} with id ${id} not found`);
	err.name = 'NotFoundError';
	throw err;
}


module.exports = {
	fromTableByUser: fromTableByUser,
	fromTableById: fromTableById
};