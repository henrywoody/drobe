const	express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		User = require('../models/user'),
		passport = require('passport'),
		jwt = require('jsonwebtoken'),
		tokenAuth = require('../middleware/token-auth'),
		handleErrors = require('../modules/handle-db-errors');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
	res.send(`
		<h1>Welcome</h1>
		<form method="POST" action="/users/register">
			<input type="text" placeholder="username" name="username">
			<input type="password" placeholder="password" name="password">
			<input type="submit">
		</form>
	`)
})

router.post('/register', async (req, res) => {
	const { user: userData } = req.body;
	const { username, password, location } = userData;

	try {
		const user = await User.register(new User({username: username, location: location}), password);

		return passport.authenticate('local', (err, info) => {
			if (!err) {
				return res.json({
					token: info.token,
					user: info.user
				})
			} else {
				return handleErrors(err, res);
			}
		})(req, res);
	} catch (err) {
		handleErrors(err, res);
	}
})

router.put('/:id', tokenAuth, async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const userModel = await User.findById(id);

		if (!userModel)
			res.sendStatus(404);

		if (user._id != id)
			res.sendStatus(403);

		const { user: userData } = req.body;
		const updatedUser = await User.findByIdAndUpdate(id, userData, {new: true});

		res.json(updatedUser);
	} catch (err) {
		handleErrors(err, res);
	}
});

router.get('/login', (req, res, next) => {
	res.send(`
		<h1>Login</h1>
		<form method="POST" action="/users/login">
			<input type="text" placeholder="username" name="username">
			<input type="password" placeholder="password" name="password">
			<input type="submit">
		</form>
	`)
})

router.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (!(username && password)) {
		const err = new Error;
		err.name = 'MissingCredentialsError';
		return handleErrors(err, res);
	}

	return passport.authenticate('local', (err, info) => {
		if (!err) {
			return res.json({
				token: info.token,
				user: info.user
			})
		} else {
			return handleErrors(err, res);
		}
	})(req, res);
})

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
})

router.get('/secret', (req, res, next) => {
	res.send('nice secret');
})

module.exports = router;
