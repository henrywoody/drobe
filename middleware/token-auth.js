const	jwt = require('jsonwebtoken'),
		mongoose = require('mongoose'),
		User = require('../models/user');

module.exports = async (req, res, next) => {
	if (req.path.match(/\/v\d+\/data\/coordinates/))
		return next();

	if (!req.headers.authorization)
		return res.sendStatus(401);

	const token = req.headers.authorization.split(' ')[1];

	let decoded;
	try {
		decoded = await jwt.verify(token, global.config.appSecret);
	} catch (err) {
		return res.sendStatus(401);
	}

	const { sub: userId } = decoded;

	try {
		const user = await User.findById(userId);
		req.user = user;
	} catch (err) {
		return res.sendStatus(401);
	}
	return next();
}