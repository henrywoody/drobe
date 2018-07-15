const	chai = require('chai'),
		assert = chai.assert,
		cleanArticleData = require('../../modules/clean-article-data'),
		camelCase = require('camelcase'),
		decamelize = require('decamelize');

describe('Clean Article Data module', () => {
	it('should keep all data for valid keys of each table', () => {
		const data = {
			'description': 'A really good article',
			'color': 'black',
			'maxTemp': 100,
			'minTemp': 60,
			'rainOk': true,
			'snowOk': false,
			'imageUrl': 'http://image.com/img',
			'rating': 4,
			'lastWorn': '2018-07-15',
			'name': 'Good Article',
			'ownerId': 1
		};
		
		for (const table of ['shirt', 'pants', 'dress', 'outerwear']) {
			let cleanData;
			if (table === 'outerwear') {
				cleanData = cleanArticleData(table, {...data, 'specificType': 'sweater'});
			} else {
				cleanData = cleanArticleData(table, data);
			}

			for (const key in data) {
				assert.include(Object.keys(cleanData), decamelize(key));
				assert.strictEqual(cleanData[decamelize(key)], data[key]);
			}
		}
	});

	it('should populate missing fields with `null`', () => {
		const data = {};
		const missingFields = [
			'description',
			'color',
			'maxTemp',
			'minTemp',
			'rainOk',
			'snowOk',
			'imageUrl',
			'rating',
			'lastWorn',
			'name',
			'ownerId'
		];

		for (const table of ['shirt', 'pants', 'dress', 'outerwear']) {
			const cleanData = cleanArticleData(table, data);

			for (const missingField of missingFields) {
				assert.include(Object.keys(cleanData), decamelize(missingField));
				assert.isNull(cleanData[decamelize(missingField)]);
			}

			if (table === 'outerwear') {
				assert.include(Object.keys(cleanData), decamelize('specificType'));
				assert.isNull(cleanData[decamelize('specificType')]);
			}
		}
	});

	it('should remove invalid fields', () => {
		const data = {
			'otherField': 'somevalue'
		};

		for (const table of ['shirt', 'pants', 'dress', 'outerwear']) {
			const cleanData = cleanArticleData(table, data);
			assert.notInclude(Object.keys(cleanData), 'otherField');
			assert.notInclude(Object.keys(cleanData), decamelize('otherField'));
		}
	});
});











