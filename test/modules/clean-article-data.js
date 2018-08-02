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
					data = {...baseData, 'specificType': 'sweater', 'shirts': [1,2], 'pants': [1,2,3], 'dresses': [2,3], 'outerwears': [5,7]};
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

	it('should populate missing fields with `null` or empty array', () => {
		const data = {};
		const baseMissingFields = [
			'description',
			'color',
			'maxTemp',
			'minTemp',
			'rainOk',
			'snowOk',
			'imageUrl',
			'name',
			'userId'
		]; // rating and lastWorn excluded for later tests

		for (const table of ['shirt', 'pants', 'dress', 'outerwear']) {
			let nestedMissingFields;
			switch (table) {
				case 'shirt':
					nestedMissingFields = ['pants', 'outerwears'];
					break;
				case 'pants':
					nestedMissingFields = ['shirts', 'outerwears'];
					break;
				case 'dress':
					nestedMissingFields = ['outerwears'];
					break;
				case 'outerwear':
					nestedMissingFields = ['shirts', 'pants', 'dresses', 'outerwears'];
					break;
			}

			const cleanData = cleanArticleData(table, data);

			for (const missingField of baseMissingFields) {
				assert.include(Object.keys(cleanData), decamelize(missingField));
				assert.isNull(cleanData[decamelize(missingField)]);
			}

			for (const nestedMissingField of nestedMissingFields) {
				assert.include(Object.keys(cleanData), decamelize(nestedMissingField));
				assert.isEmpty(cleanData[decamelize(nestedMissingField)]);
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

	it('should set rating to 1 if not given but not override if given', () => {
		const cleanData1 = cleanArticleData('shirt', {});
		assert.strictEqual(cleanData1.rating, 1);

		const cleanData2 = cleanArticleData('shirt', {rating: 5});
		assert.strictEqual(cleanData2.rating, 5);
	});

	it('should remove the lastWorn field if left empty but leave if given', () => {
		const cleanData1 = cleanArticleData('pants', {});
		assert.notInclude(Object.keys(cleanData1), 'last_worn');

		const cleanData2 = cleanArticleData('pants', {lastWorn: new Date()});
		assert.include(Object.keys(cleanData2), 'last_worn');
	});
});











