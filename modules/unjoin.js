const	query = require('./query'),
		getJoinTable = require('./get-join-table');

async function tableIdToTableId(table1, id1, table2, id2) {
	const joinTable = getJoinTable(table1, table2);

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

	await query(queryText, queryValues);
}

module.exports = {
	tableIdToTableId: tableIdToTableId
}