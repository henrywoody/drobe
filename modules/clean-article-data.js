const camelCase = require('camelcase');

const articleFields = [
	'description',
	'color',
	'max_temp',
	'min_temp',
	'rain_ok',
	'snow_ok',
	'image_url',
	'rating',
	'last_worn',
	'name',
	'owner_id'
];

const fieldsForTable = {
	shirt: articleFields,
	pants: articleFields,
	dress: articleFields,
	outerwear: [
		...articleFields,
		'specific_type'
	]
}

module.exports = (table, data) => {
	const cleanData = {};
	for (const key of fieldsForTable[table])
		if (Object.keys(data).includes(camelCase(key))) {
			cleanData[key] = data[camelCase(key)];
		} else {
			cleanData[key] = null;
		}
	return cleanData;
}