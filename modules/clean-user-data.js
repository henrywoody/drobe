const camelCase = require('camelcase');

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
			cleanData[key] = userData[camelCase(key)];
		} else {
			cleanData[key] = null;
		}
	}
	return cleanData;
}