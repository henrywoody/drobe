const	chai = require('chai'),
		assert = chai.assert,
		cleanArticleData = require('../../modules/clean-article-data'),
		camelCase = require('camelcase'),
		decamelize = require('decamelize');

describe('Clean Article Data module', () => {
	it('should keep all data for valid keys of each table and convert camelCase to snake_case', () => {
		const baseData = {
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
			'userId': 1
		};
		
		for (const table of ['shirt', 'pants', 'dress', 'outerwear']) {
			let data;
			switch (table) {
				case 'shirt':
					data = {...baseData, 'pants': [1,2], 'outerwears': [5,6]};
					break;
				case 'pants':
					data = {...baseData, 'shirts': [1,2], 'outerwears': [5,6]};
					break;
				case 'dress':
					data = {...baseData, 'outerwears': [5,6]};
					break;
				case 'outerwear':
					data = {...baseData, 'specificKind': 'sweater', 'shirts': [1,2], 'pants': [1,2,3], 'dresses': [2,3], 'outerwears': [5,7]};
					break;
			}
			const cleanData = cleanArticleData(table, data);

			for (const key in data) {
				assert.include(Object.keys(cleanData), decamelize(key));

				if (Array.isArray(data[key])) {
					for (const x of data[key])
						assert.include(cleanData[decamelize(key)], x);
				} else {
					assert.strictEqual(cleanData[decamelize(key)], data[key]);
				}
			}
		}
	});

	it('should exclude any missing fields but include nested fields (those for other models)', () => {
		const data = {}

		const cleanShirtData = cleanArticleData('shirt', data);
		assert.strictEqual(Object.keys(cleanShirtData).length, 2);
		assert.include(Object.keys(cleanShirtData), 'pants');
		assert.include(Object.keys(cleanShirtData), 'outerwears');

		const cleanPantsData = cleanArticleData('pants', data);
		assert.strictEqual(Object.keys(cleanPantsData).length, 2);
		assert.include(Object.keys(cleanPantsData), 'shirts');
		assert.include(Object.keys(cleanPantsData), 'outerwears');

		const cleanDressData = cleanArticleData('dress', data);
		assert.strictEqual(Object.keys(cleanDressData).length, 1);
		assert.include(Object.keys(cleanDressData), 'outerwears');

		const cleanOuterwearData = cleanArticleData('outerwear', data);
		assert.strictEqual(Object.keys(cleanOuterwearData).length, 4);
		assert.include(Object.keys(cleanOuterwearData), 'shirts');
		assert.include(Object.keys(cleanOuterwearData), 'pants');
		assert.include(Object.keys(cleanOuterwearData), 'dresses');
		assert.include(Object.keys(cleanOuterwearData), 'outerwears');
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











