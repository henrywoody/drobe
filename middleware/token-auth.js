const	jwt = require('jsonwebtoken'),
		query = require('../modules/query'),
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
				const queryText = 'SELECT * FROM app_user WHERE id = $1';
				const queryValues = [userId];
				const { rows } = await query(queryText, queryValues);
				if (rows.length) {
					const user = rows[0];
					req.user = user;
					return next();
				}
			} catch (err) {
				return res.sendStatus(500);
			}
		} else {
			const err = new Error('User information not found');
			err.name = 'UserNotFound';
			return handleErrors(err, res);
		}
	});
}