const	express = require('express'),
		router = express.Router(),
		passport = require('passport'),
		jwt = require('jsonwebtoken'),
		tokenAuth = require('../middleware/token-auth'),
		handleErrors = require('../modules/handle-db-errors'),
		bcrypt = require('bcrypt'),
		query = require('../modules/query');


router.post('/register', async (req, res) => {
	const { user: userData } = req.body;
	if (!userData) { // check that user object was given
		const err = new Error;
		err.name = 'FormatError';
		return handleErrors(err, res);
	}
	const { email, password, locationName, longitude, latitude } = userData;

	// for passport
	req.body.username = email; //it _does_ have to be username (for passport)
	req.body.password = password;

	try {
		const salt = await bcrypt.genSalt(10);
		let user;
		try {
			const hash = await bcrypt.hash(password, salt);
			const queryText = "INSERT INTO app_user(id, email, password, location_name, longitude, latitude) VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *";
			const queryValues = [email, hash, locationName, longitude, latitude];
			const insertResult = await query(queryText, queryValues);
			const { rows } = insertResult;
			if (!rows) {
				const { name, detail } = insertResult;
				if (name === 'error' && detail.match(/Key \(email\)=\(.*?\) already exists./)) {
					const err = new Error;
					err.name = 'UserExistsError';
					throw err;
				}
			} else {
				user = rows[0];
			}
		} catch (err) {
			return handleErrors(err, res);
		}

		return passport.authenticate('local', (err, success, info) => {
			if (!err && success) {
				return res.json({
					success,
					message: info.message,
					token: info.token,
					user: info.userData
				})
			} else {
				return handleErrors(err, res);
			}
		})(req, res);
	} catch (err) {
		return handleErrors(err, res);
	}
})

router.put('/:id', tokenAuth, async (req, res) => {
	// TODO change password functionality
	const { user } = req;
	const { id } = req.params;

	try {
		const querySelectText = "SELECT * FROM app_user WHERE id = $1";
		const querySelectValues = [id];
		const { rows } = await query(querySelectText, querySelectValues);

		if (!rows.length)
			res.sendStatus(404);

		if (user.id != id)
			res.sendStatus(403);

		const {
			email: newEmail,
			locationName: newLocationName,
			longitude: newLongitude,
			latitude: newLatitude
		} = req.body.user;
		const queryUpdateText = `UPDATE app_user
					SET (email, location_name, longitude, latitude) = ($2, $3, $4, $5)
					WHERE id = $1
					RETURNING *`;
		const queryUpdateValues = [id, newEmail, newLocationName, newLongitude, newLatitude];
		const { rows: updatedRows } = await query(queryUpdateText, queryUpdateValues);

		const responseData = {};
		for (const key in updatedRows[0])
			if (key !== 'password') 
				responseData[key] = updatedRows[0][key];

		res.json(responseData);
	} catch (err) {
		handleErrors(err, res);
	}
});

router.post('/login', (req, res) => {
	const { user: userData } = req.body;
	if (!userData) { // check that user object was given
		const err = new Error;
		err.name = 'FormatError';
		return handleErrors(err, res);
	}
	const { email, password } = userData;

	// for passport
	req.body.username = email;
	req.body.password = password;

	if (!(email && password)) {
		const err = new Error;
		err.name = 'MissingCredentialsError';
		return handleErrors(err, res);
	}

	return passport.authenticate('local', (err, success, info) => {
		if (!err && success) {
			return res.json({
				success,
				message: info.message,
				token: info.token,
				user: info.userData
			})
		} else {
			return handleErrors(err, res);
		}
	})(req, res);
})

router.get('/logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
})

module.exports = router;
