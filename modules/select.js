const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		camelCaseKeys = require('./camel-case-keys'),
		singularize = require('./singularize'),
		getAllJoins = require('./get-all-joins');

async function fromTableByUser(table, userId) {
	checkTableIsAllowed(table);
	
	const queryText = `SELECT * FROM ${table} WHERE owner_id = $1`;
	const queryValues = [userId];
	const { rows } = await query(queryText, queryValues);
	return rows.map(e => {
		return camelCaseKeys(e);
	});
}

async function fromTableByIdWithJoins(table, id) {
	const object = await fromTableById(table, id);

	const joins = await getAllJoins.forTableById(table, id);
	const joinedObjects = await fromTablesByIds(joins);

	return {
		...object,
		...joinedObjects
	};
}

async function fromTableById(table, id) {
	checkTableIsAllowed(table);

	const queryText = `SELECT * FROM ${table} WHERE id = $1`;
	const queryValues = [id];
	const { rows } = await query(queryText, queryValues);
	if (rows.length)
		return camelCaseKeys(rows[0]);
	
	throwNotFoundError(table, id);
}

async function fromTablesByIds(tableIdLists) {
	for (const pluralTable in tableIdLists)
		checkTableIsAllowed(singularize(pluralTable));

	const results = {};
	for (const pluralTable in tableIdLists) {
		const table = singularize(pluralTable);
		const queryText = `SELECT * FROM ${table} WHERE id = ANY ($1)`;
		const queryValues = [tableIdLists[pluralTable]];
		const { rows } = await query(queryText, queryValues);
		if (rows.length === tableIdLists[pluralTable].length) {
			results[pluralTable] = rows.map(e => camelCaseKeys(e));
		} else {
			throwNotFoundError(table, `in [${tableIdLists[pluralTable]}]`);
		}
	}
	return results;
}

async function fromTableForUserAndTemp(table, ownerId, temp) {
	checkTableIsAllowed(table);

	const queryText = `SELECT * FROM ${table} WHERE owner_id = $1 AND (min_temp <= $2 OR min_temp IS NULL) AND (max_temp >= $2 OR max_temp IS NULL)`;
	const queryValues = [ownerId, temp];
	const { rows } = await query(queryText, queryValues);

	return rows.map(e => camelCaseKeys(e));
}

function throwNotFoundError(table, id) {
	const err = new Error(`${table} with id ${id} not found`);
	err.name = 'NotFoundError';
	throw err;
}

module.exports = {
	fromTableByUser: fromTableByUser,
	fromTableByIdWithJoins: fromTableByIdWithJoins,
	fromTableById: fromTableById,
	fromTablesByIds: fromTablesByIds,
	fromTableForUserAndTemp: fromTableForUserAndTemp
};