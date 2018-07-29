const 	query = require('./query'),
		select = require('./select'),
		camelCaseKeys = require('./camel-case-keys'),
		getJoinTable = require('./get-join-table');

async function tableIdToTableId(table1, id1, table2, id2) {
	const joinTable = getJoinTable(table1, table2);
	await checkHaveSameOwner(table1, id1, table2, id2);
	alreadyJoined = await joinAlreadyExists(joinTable, table1, id1, table2, id2);
	if (alreadyJoined)
		return null;

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
		default:
			console.log('WHAT THE FUCK')
	}
	
	const { rows } = await query(queryText, queryValues);
	return camelCaseKeys(rows[0]);
}

async function checkHaveSameOwner(table1, id1, table2, id2) {
	const object1 = await select.fromTableById(table1, id1);
	const object2 = await select.fromTableById(table2, id2);

	if (object1.ownerId !== object2.ownerId) {
		const err = new Error('Articles are not owned by the same owner');
		err.name = 'ValidationError';
		throw err;
	}
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
	tableIdToTableId: tableIdToTableId
}