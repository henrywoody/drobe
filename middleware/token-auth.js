const	jwt = require('jsonwebtoken'),
		selectUser = require('../modules/select-user'),
		handleErrors = require('../modules/handle-db-errors');

module.exports = async (req, res, next) => {
	if (req.path.match(/\/v\d+\/data\/coordinates/))
		return next();

	if (!req.headers.authorization)
		return res.sendStatus(401);

	const token = req.headers.authorization.split(' ')[1];

	return jwt.verify(token, global.config.appSecret, async (err, decoded) => {
		if (!err) {
			const userId = decoded.sub;
			try {
				const user = await selectUser.byId(userId);

				if (user) {
					req.user = user;
					return next()
				}
			} catch (err) {
				return handleErrors(err, res);
			}
		} else {
			const err = new Error('User information not found');
			err.name = 'UserNotFound';
			return handleErrors(err, res);
		}
	});
}