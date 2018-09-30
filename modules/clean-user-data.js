const	camelCase = require('camelcase'),
		emailValidator = require('email-validator');

const fields = [
	'email',
	'password',
	'location_name',
	'longitude',
	'latitude'
];

module.exports = (userData) => {
	const cleanData = {};
	for (const key of fields) {
		if (Object.keys(userData).includes(camelCase(key))) {
			if (key === 'email' && !emailValidator.validate(userData[camelCase(key)])) {
				const err = new Error;
				err.name = 'InvalidEmailError'
				throw err;
			} else {
				cleanData[key] = userData[camelCase(key)];
			}
		} else {
			cleanData[key] = null;
		}
	}
	return cleanData;
}