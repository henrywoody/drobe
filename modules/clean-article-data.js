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
	'user_id'
];

const fieldsForTable = {
	shirt: [
		...articleFields,
		'pants',
		'outerwears'
	],
	pants: [
		...articleFields,
		'shirts',
		'outerwears'
	],
	dress: [
		...articleFields,
		'outerwears'
	],
	outerwear: [
		...articleFields,
		'specific_kind',
		'shirts',
		'pants',
		'dresses',
		'outerwears'
	]
}

module.exports = (table, data) => {
	const cleanData = {};
	for (const key of fieldsForTable[table]) {
		if (Object.keys(data).includes(camelCase(key))) {
			cleanData[key] = data[camelCase(key)];
		} else if (['shirts', 'pants', 'dresses', 'outerwears'].includes(key)) {
			cleanData[key] = [];
		}
	}
	return cleanData;
}