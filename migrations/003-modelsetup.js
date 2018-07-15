const query = require('../modules/query');

queryText = `CREATE TABLE shirt (
	id SERIAL PRIMARY KEY,
	name text NOT NULL,
	owner_id integer REFERENCES app_user(id) NOT NULL,
	UNIQUE (name, owner_id)
) INHERITS (article);

CREATE TABLE pants (
	id SERIAL PRIMARY KEY,
	name text NOT NULL,
	owner_id integer REFERENCES app_user(id) NOT NULL,
	UNIQUE (name, owner_id)
) INHERITS (article);

CREATE TYPE outerwear_type AS ENUM ('sweater', 'jacket', 'vest', 'raincoat', 'snowcoat');

CREATE TABLE outerwear (
	id SERIAL PRIMARY KEY,
	name text NOT NULL,
	owner_id integer REFERENCES app_user(id) NOT NULL,
	UNIQUE (name, owner_id),
	specific_type outerwear_type
) INHERITS (article);

CREATE TABLE dress (
	id SERIAL PRIMARY KEY,
	name text NOT NULL,
	owner_id integer REFERENCES app_user(id) NOT NULL,
	UNIQUE (name, owner_id)
) INHERITS (article);`;

query(queryText, []);