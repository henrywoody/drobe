const query = require('../modules/query');

const queryText = `ALTER TABLE app_user RENAME username TO email;
ALTER TABLE app_user RENAME CONSTRAINT app_user_username_key to app_user_email_key`;

query(queryText);