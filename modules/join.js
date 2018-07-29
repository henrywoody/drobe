const 	query = require('./query'),
		select = require('./select'),
		camelCaseKeys = require('./camel-case-keys'),
		getJoinTables = require('./get-join-tables'),
		singularize = require('./singularize');

async function tableByIdToTableById(table1, id1, table2, id2) {
	const joinTable = getJoinTables.forPair(table1, table2);
	await checkHaveSameOwner(table1, id1, table2, id2);
	const alreadyJoined = await joinAlreadyExists(joinTable, table1, id1, table2, id2);
	if (alreadyJoined)
		return null;

	const { queryText, queryValues } = getQueryTextAndValues(joinTable, table1, id1, table2, id2);
	
	const { rows } = await query(queryText, queryValues);
	return camelCaseKeys(rows[0]);
}

async function tableByIdToMany(table, id, tableIdLists) {
	for (const otherTable in tableIdLists) // to check all are valid
		getJoinTables.forPair(table, singularize(otherTable));
	await checkAllHaveSameOwner(table, id, tableIdLists);

	for (const pluralOtherTable in tableIdLists) {
		const otherTable = singularize(pluralOtherTable);
		const joinTable = getJoinTables.forPair(table, otherTable);
		for (const otherId of tableIdLists[pluralOtherTable]) {
			const alreadyJoined = await joinAlreadyExists(joinTable, table, id, otherTable, otherId);
			if (!alreadyJoined) {
				const { queryText, queryValues } = getQueryTextAndValues(joinTable, table, id, otherTable, otherId);
				await query(queryText, queryValues);
			}
		}
	}
	return tableIdLists;
}

function getQueryTextAndValues(joinTable, table1, id1, table2, id2) {
	let queryText, queryValues;
	switch (joinTable) {
		case 'shirt_pants_join':
			queryText = "INSERT INTO shirt_pants_join(shirt_id, pants_id) VALUES ($1, $2) RETURNING *";
			queryValues = table1 === 'shirt' ? [id1, id2] : [id2, id1];
			break;
		case 'shirt_outerwear_join':
			queryText = "INSERT INTO shirt_outerwear_join(shirt_id, outerwear_id) VALUES ($1, $2) RETURNING *";
			queryValues = table1 === 'shirt' ? [id1, id2] : [id2, id1];
			break;
		case 'pants_outerwear_join':
			queryText = "INSERT INTO pants_outerwear_join(pants_id, outerwear_id) VALUES ($1, $2) RETURNING *";
			queryValues = table1 === 'pants' ? [id1, id2] : [id2, id1];
			break;
		case 'outerwear_outerwear_join':
			queryText = "INSERT INTO outerwear_outerwear_join(a_outerwear_id, b_outerwear_id) VALUES ($1, $2) RETURNING *";
			queryValues = [id1, id2];
			break;
		case 'dress_outerwear_join':
			queryText = "INSERT INTO dress_outerwear_join(dress_id, outerwear_id) VALUES ($1, $2) RETURNING *";
			queryValues = table1 === 'dress' ? [id1, id2] : [id2, id1];
			break;
	}
	return { queryText, queryValues };
}

async function checkHaveSameOwner(table1, id1, table2, id2) {
	const ownerId1 = await getOwnerId(table1, id1);
	const ownerId2 = await getOwnerId(table2, id2);

	if (ownerId1 !== ownerId2)
		throwDifferentOwnersError();
}

async function checkAllHaveSameOwner(table, id, tableIdLists) {
	const mainOwnerId = await getOwnerId(table, id);
	const otherOwnerIds = [];

	for (const pluralOtherTable in tableIdLists) {
		const otherTable = singularize(pluralOtherTable);
		ownerIdsForTable = await Promise.all(tableIdLists[pluralOtherTable].map(id => getOwnerId(otherTable, id)));
		otherOwnerIds.push(...ownerIdsForTable)
	}

	if (!otherOwnerIds.every(ownerId => ownerId === mainOwnerId))
		throwDifferentOwnersError();
}

async function getOwnerId(table, id) {
	const object = await select.fromTableById(table, id);
	return object.ownerId;
}

function throwDifferentOwnersError() {
	const err = new Error('Articles are not owned by the same owner');
	err.name = 'ValidationError';
	throw err;
}

async function joinAlreadyExists(joinTable, column1, id1, column2, id2) {
	let queryText;
	if (joinTable === 'outerwear_outerwear_join') {
		queryText = "SELECT * FROM outerwear_outerwear_join WHERE a_outerwear_id = $1 AND b_outerwear_id = $2 OR a_outerwear_id = $2 AND b_outerwear_id = $1";
	} else {
		queryText = `SELECT * FROM ${joinTable} WHERE ${column1}_id = $1 AND ${column2}_id = $2`;
	}
	const queryValues = [id1, id2];
	const { rows } = await query(queryText, queryValues);
	if (rows.length)
		return true;
	return false;
}

module.exports = {
	tableByIdToTableById: tableByIdToTableById,
	tableByIdToMany: tableByIdToMany
}