const camelCase = require('camelcase');

module.exports = (obj) => {
	camelCasedObj = {};
	for (const key in obj)
		camelCasedObj[camelCase(key)] = obj[key];
	return camelCasedObj;
}