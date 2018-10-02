const	express = require('express'),
		router = express.Router(),
		passport = require('passport'),
		jwt = require('jsonwebtoken'),
		tokenAuth = require('../middleware/token-auth'),
		handleErrors = require('../modules/handle-db-errors'),
		bcrypt = require('bcrypt'),
		createUser = require('../modules/create-user'),
		updateUser = require('../modules/update-user'),
		selectUser = require('../modules/select-user'),
		request = require('request-promise-native'),
		{ OAuth2Client } = require('google-auth-library');

router.post('/register', async (req, res) => {
	const { user: userData } = req.body;
	if (!userData) { // check that user object was given
		const err = new Error;
		err.name = 'FormatError';
		return handleErrors(err, res);
	}

	const { email, password } = userData;
	// for passport
	req.body.email = email.toLowerCase();
	req.body.password = password;

	try {
		const salt = await bcrypt.genSalt(10);
		let user;
		try {
			const hash = await bcrypt.hash(password, salt);
			userData.password = hash;
			user = await createUser({...userData, email: email.toLowerCase()});
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
		if (!existingUser) {
			res.sendStatus(404);
		}

		if (user.id != id) {
			res.sendStatus(403);
		}

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
		if (!existingUser) {
			res.sendStatus(404);
		}

		if (user.id != id) {
			res.sendStatus(403);
		}

		const { user: userData } = req.body;
		
		const updatedUser = await updateUser(id, userData);

		const responseData = {};
		for (const key in updatedUser) {
			if (key !== 'password') {
				responseData[key] = updatedUser[key];
			}
		}

		res.json(responseData);
	} catch (err) {
		handleErrors(err, res);
	}
});

function sendTokenAndUser(user, res) {
	const payload = {sub: user.id};
	const token = jwt.sign(payload, global.config.appSecret);
	const userData = {};
	for (const key in user) {
		if (key !== 'password') {
			userData[key] = user[key];
		}
	}

	return res.json({
		token,
		user: userData
	});
}

router.post('/login/facebook', async (req, res) => {
	const { accessToken: userToken } = req.body;

	// verify token
	let facebookId;
	try {
		const tokenResponse = await request(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${global.config.facebookAppId}|${global.config.facebookAppSecret}`)
		const { data: tokenData } = JSON.parse(tokenResponse);
		if (!tokenData.is_valid) throw new Error;
		facebookId = tokenData.user_id;
	} catch (error) {
		const err = new Error;
		err.name = 'ForbiddenError';
		return handleErrors(err, res);
	}

	let user;
	try {
		user = await selectUser.byFacebookId(facebookId);
	} catch (err) {
		if (err.name === 'UserNotFoundError') {
			user = await createUser({facebookId: facebookId});
		} else {
			return handleErrors(err, res);
		}
	}

	return sendTokenAndUser(user, res);
});

router.post('/login/google', async (req, res) => {
	const { tokenId: userToken } = req.body;

	// verify token
	let googleId;
	try {
		oauthClient = new OAuth2Client(global.config.googleAppId);
		const ticket = await oauthClient.verifyIdToken({
			idToken: userToken,
			audience: global.config.googleAppId
		});
		const payload = ticket.getPayload();
		googleId = payload.sub;
	} catch (error) {
		const err = new Error;
		err.name = 'ForbiddenError';
		return handleErrors(err, res);
	}

	let user;
	try {
		user = await selectUser.byGoogleId(googleId);
	} catch (err) {
		if (err.name === 'UserNotFoundError') {
			user = await createUser({googleId: googleId});
		} else {
			return handleErrors(err, res);
		}
	}

	return sendTokenAndUser(user, res);
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
	req.body.email = email.toLowerCase();
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
});


router.get('/logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
});

module.exports = router;
