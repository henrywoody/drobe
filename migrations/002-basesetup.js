const query = require('../modules/query');

queryText = `CREATE TABLE app_user (
	id SERIAL PRIMARY KEY,
	email text NOT NULL UNIQUE,
	password text,
	location_name text,
	longitude decimal,
	latitude decimal
);

CREATE TABLE article (
	id SERIAL PRIMARY KEY,
	description text,
	color text,
	max_temp integer,
	min_temp integer,
	rain_ok boolean,
	snow_ok boolean,
	image_url text,
	rating integer CHECK (rating > 0 AND rating < 6),
	last_worn date
);

CREATE TABLE wear_date (
	article_id integer REFERENCES article,
	wear_date date
);`;

query(queryText, []);