const query = require('../modules/query');

const queryText = `ALTER TABLE shirt ADD COLUMN article_kind text DEFAULT 'shirt';
ALTER TABLE pants ADD COLUMN article_kind text DEFAULT 'pants';
ALTER TABLE dress ADD COLUMN article_kind text DEFAULT 'dress';
ALTER TABLE outerwear ADD COLUMN article_kind text DEFAULT 'outerwear';
`;

query(queryText);