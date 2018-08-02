const	query = require('./query'),
		camelCaseKeys = require('./camel-case-keys');

async function byId(id, {includePassword=false}={}) {
	const queryText = includePassword ? (
		"SELECT id, username, password, location_name, longitude, latitude FROM app_user WHERE id = $1"
	) : ( 
		"SELECT id, username, location_name, longitude, latitude FROM app_user WHERE id = $1"
	);
	const queryValues = [id];
	const { rows } = await query(queryText, queryValues);
	
	if (!rows.length)
		throwUserNotFoundError();

	return camelCaseKeys(rows[0]);
}

async function byUsername(username, {includePassword=false}={}) {
	const queryText = includePassword ? (
		"SELECT id, username, password, location_name, longitude, latitude FROM app_user WHERE username = $1"
	) : ( 
		"SELECT id, username, location_name, longitude, latitude FROM app_user WHERE username = $1"
	);
	const queryValues = [username];
	const { rows } = await query(queryText, queryValues);

	if (!rows.length)
		throwUserNotFoundError();

	return camelCaseKeys(rows[0]);
}


function throwUserNotFoundError() {
	const err = Error('User not found');
	err.name = 'UserNotFoundError';
	throw err;
}

module.exports = {
	byId: byId,
	byUsername: byUsername
}