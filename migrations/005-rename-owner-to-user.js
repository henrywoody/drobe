const query = require('../modules/query');

const queryText = ['shirt', 'pants', 'dress', 'outerwear'].map(table => {
	return `ALTER TABLE ${table} RENAME owner_id TO user_id;
ALTER TABLE ${table} RENAME CONSTRAINT ${table}_owner_id_fkey TO ${table}_user_id_fkey;
ALTER INDEX ${table}_name_owner_id_key RENAME TO ${table}_name_user_id_key;`;
}).join('\n');

query(queryText);