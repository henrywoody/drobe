const query = require('../modules/query');

const queryText = `
ALTER TABLE app_user
ALTER COLUMN email DROP NOT NULL,
ADD COLUMN facebook_id TEXT UNIQUE,
ADD COLUMN google_id TEXT UNIQUE,
ADD CONSTRAINT CHK_identifier CHECK (email IS NOT NULL OR facebook_id IS NOT NULL OR google_id IS NOT NULL)`;

query(queryText);