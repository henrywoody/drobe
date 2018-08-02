const	express = require('express'),
		router = express.Router(),
		passport = require('passport'),
		jwt = require('jsonwebtoken'),
		tokenAuth = require('../middleware/token-auth'),
		handleErrors = require('../modules/handle-db-errors'),
		bcrypt = require('bcrypt'),
		createUser = require('../modules/create-user'),
		updateUser = require('../modules/update-user'),
		selectUser = require('../modules/select-user');


router.post('/register', async (req, res) => {
	const { user: userData } = req.body;
	if (!userData) { // check that user object was given
		const err = new Error;
		err.name = 'FormatError';
		return handleErrors(err, res);
	}

	const { username, password } = userData;
	// for passport
	req.body.username = username;
	req.body.password = password;

	try {
		const salt = await bcrypt.genSalt(10);
		let user;
		try {
			const hash = await bcrypt.hash(password, salt);
			userData.password = hash;
			user = await createUser(userData);
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
});

router.put('/:id/password', tokenAuth, async (req, res) => {
	const { user } = req;
	const { id } = req.params;

	try {
		const existingUser = await selectUser.byId(id);
		if (!existingUser)
			res.sendStatus(404);

		if (user.id != id)
			res.sendStatus(403);

		const { password: newPassword } = req.body;

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(newPassword, salt);

		const updatedUser = await updateUser(id, {...user, password: hash}, {includePassword: true});
		
		res.json({'message': 'Successfully updated password.'})		
	} catch (err) {
		handleErrors(err, res)
	}
});

router.put('/:id', tokenAuth, async (req, res) => {
	const { user } = req;
	const { id } = req.params;

	try {
		const existingUser = await selectUser.byId(id);
		if (!existingUser)
			res.sendStatus(404);

		if (user.id != id)
			res.sendStatus(403);

		const { user: userData } = req.body;
		
		const updatedUser = await updateUser(id, userData);

		const responseData = {};
		for (const key in updatedUser)
			if (key !== 'password') 
				responseData[key] = updatedUser[key];

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
	const { username, password } = userData;

	// for passport
	req.body.username = username;
	req.body.password = password;

	if (!(username && password)) {
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
