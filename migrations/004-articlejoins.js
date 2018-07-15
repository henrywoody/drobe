const query = require('../modules/query');

queryText = `CREATE TABLE shirt_pants_join (
	shirt_id integer REFERENCES shirt(id),
	pants_id integer REFERENCES pants(id),
	PRIMARY KEY(shirt_id, pants_id)
);

CREATE TABLE shirt_outerwear_join (
	shirt_id integer REFERENCES shirt(id),
	outerwear_id integer REFERENCES outerwear(id),
	PRIMARY KEY(shirt_id, outerwear_id)
);

CREATE TABLE pants_outerwear_join (
	pants_id integer REFERENCES pants(id),
	outerwear_id integer REFERENCES outerwear(id),
	PRIMARY KEY(pants_id, outerwear_id)
);

CREATE TABLE dress_outerwear_join (
	dress_id integer REFERENCES dress(id),
	outerwear_id integer REFERENCES outerwear(id),
	PRIMARY KEY(dress_id, outerwear_id)
);

CREATE TABLE outerwear_outerwear_join (
	a_outerwear_id integer REFERENCES outerwear(id),
	b_outerwear_id integer REFERENCES outerwear(id),
	PRIMARY KEY(a_outerwear_id, b_outerwear_id)
);

CREATE UNIQUE INDEX unq_outerwear_join_a_b 
  ON outerwear_outerwear_join ( LEAST(a_outerwear_id, b_outerwear_id), GREATEST( 
a_outerwear_id, b_outerwear_id));`;

query(queryText, []);