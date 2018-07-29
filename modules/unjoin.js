const	query = require('./query'),
		getJoinTables = require('./get-join-tables'),
		singularize = require('./singularize');

async function tableByIdToTableById(table1, id1, table2, id2) {
	const joinTable = getJoinTables.forPair(table1, table2);

	const { queryText, queryValues } = getQueryTextAndValues(joinTable, table1, id1, table2, id2);

	await query(queryText, queryValues);
}

async function tableByIdToMany(table, id, tableIdLists) {
	for (const pluralOtherTable in tableIdLists) // to check all are valid
		getJoinTables.forPair(table, singularize(pluralOtherTable));

	for (const pluralOtherTable in tableIdLists) {
		const otherTable = singularize(pluralOtherTable);
		const joinTable = getJoinTables.forPair(table, otherTable);

		for (const otherId of tableIdLists[pluralOtherTable]) {
			const { queryText, queryValues } = getQueryTextAndValues(joinTable, table, id, otherTable, otherId);
			await query(queryText, queryValues);
		}
	}
}

async function allForTableById(table, id) {
	const joinTables = getJoinTables.forTable(table);
	for (const joinTable of joinTables) {
		let queryText, queryValues;
		if (joinTable === 'outerwear_outerwear_join') {
			queryText = "DELETE FROM outerwear_outerwear_join * WHERE a_outerwear_id = $1 OR b_outerwear_id = $1";
			queryValues = [id];
		} else {
			queryText = `DELETE FROM ${joinTable} * WHERE ${table}_id = $1`;
			queryValues = [id];
		}
		await query(queryText, queryValues);
	}
}

function getQueryTextAndValues(joinTable, table1, id1, table2, id2) {
	let queryText, queryValues;
	switch (joinTable) {
		case 'shirt_pants_join':
			queryText = "DELETE FROM shirt_pants_join * WHERE shirt_id = $1 AND pants_id = $2";
			queryValues = table1 === 'shirt' ? [id1, id2] : [id2, id1];
			break;
		case 'shirt_outerwear_join':
			queryText = "DELETE FROM shirt_outerwear_join * WHERE shirt_id = $1 AND outerwear_id = $2";
			queryValues = table1 === 'shirt' ? [id1, id2] : [id2, id1];
			break;
		case 'pants_outerwear_join':
			queryText = "DELETE FROM pants_outerwear_join * WHERE pants_id = $1 AND outerwear_id = $2";
			queryValues = table1 === 'pants' ? [id1, id2] : [id2, id1];
			break;
		case 'outerwear_outerwear_join':
			queryText = "DELETE FROM outerwear_outerwear_join * WHERE a_outerwear_id = $1 AND b_outerwear_id = $2 OR a_outerwear_id = $2 AND b_outerwear_id = $1";
			queryValues = [id1, id2];
			break;
		case 'dress_outerwear_join':
			queryText = "DELETE FROM dress_outerwear_join * WHERE dress_id = $1 OR outerwear_id = $2";
			queryValues = table1 === 'dress' ? [id1, id2] : [id2, id1];
			break;
	}
	return { queryText, queryValues };
}

module.exports = {
	tableByIdToTableById: tableByIdToTableById,
	tableByIdToMany: tableByIdToMany,
	allForTableById: allForTableById
}