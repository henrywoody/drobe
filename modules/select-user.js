const	query = require('./query'),
		camelCaseKeys = require('./camel-case-keys');

async function byId(id, {includePassword=false}={}) {
	const queryText = includePassword ? (
		"SELECT id, email, facebook_id, google_id, password, location_name, longitude, latitude FROM app_user WHERE id = $1"
	) : ( 
		"SELECT id, email, facebook_id, google_id, location_name, longitude, latitude FROM app_user WHERE id = $1"
	);
	const queryValues = [id];
	const { rows } = await query(queryText, queryValues);
	
	if (!rows.length) {
		throwUserNotFoundError();
	}

	return camelCaseKeys(rows[0]);
}

async function byEmail(email, {includePassword=false}={}) {
	const queryText = includePassword ? (
		"SELECT id, email, facebook_id, google_id, password, location_name, longitude, latitude FROM app_user WHERE email = $1"
	) : ( 
		"SELECT id, email, facebook_id, google_id, location_name, longitude, latitude FROM app_user WHERE email = $1"
	);
	const queryValues = [email];
	const { rows } = await query(queryText, queryValues);

	if (!rows.length) {
		throwUserNotFoundError();
	}

	return camelCaseKeys(rows[0]);
}

async function byFacebookId(facebookId) {
	const queryText = "SELECT id, email, facebook_id, google_id, location_name, longitude, latitude FROM app_user WHERE facebook_id = $1";
	const queryValues = [facebookId];
	const { rows } = await query(queryText, queryValues);

	if (!rows.length) {
		throwUserNotFoundError();
	}

	return camelCaseKeys(rows[0]);
}

async function byGoogleId(googleId) {
	const queryText = "SELECT id, email, facebook_id, google_id, location_name, longitude, latitude FROM app_user WHERE google_id = $1";
	const queryValues = [googleId];
	const { rows } = await query(queryText, queryValues);

	if (!rows.length) {
		throwUserNotFoundError();
	}

	return camelCaseKeys(rows[0]);
}

function throwUserNotFoundError() {
	const err = Error('User not found');
	err.name = 'UserNotFoundError';
	throw err;
}

module.exports = {
	byId: byId,
	byEmail: byEmail,
	byFacebookId: byFacebookId,
	byGoogleId: byGoogleId
}