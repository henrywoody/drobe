const query = require('../modules/query');

const queryText = "ALTER TABLE outerwear RENAME specific_type TO specific_kind";

query(queryText);