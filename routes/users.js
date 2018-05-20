const	express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		User = require('../models/user'),
		passport = require('passport');


mongoose.connect(process.env.DB_HOST);

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

router.post('/register', async (req, res, next) => {
	const { username, password } = req.body;
	try {
		const user = await User.register(new User({username: username}), password);
		passport.authenticate('local')(req, res, () => {
			res.redirect('/users/secret')
		})
	} catch (err) {
		console.log(err)
		return res.redirect('/users/register');
	}
})

router.get('/secret', (req, res, next) => {
	res.send('nice secret');
})

module.exports = router;
