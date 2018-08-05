const query = require('../modules/query');

const queryText = "ALTER TABLE article ALTER COLUMN rating SET DEFAULT 1";

query(queryText);