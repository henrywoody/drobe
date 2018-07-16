const	chai = require('chai'),
		assert = chai.assert,
		cleanUserData = require('../../modules/clean-user-data'),
		camelCase = require('camelcase'),
		decamelize = require('decamelize');

describe('Clean User Data module', () => {
	it('should keep all the data for valid keys', () => {
		const data = {
			email: 'test@example.com',
			password: 'goodpassword1',
			locationName: 'Good Town, USA',
			longitude: -115.5,
			latitude: 35.0
		};

		const cleanData = cleanUserData(data);
		for (const key in data) {
			assert.include(Object.keys(cleanData), decamelize(key));
			assert.strictEqual(cleanData[decamelize(key)], data[key]);
		}
	});

	it('should populate missing fields with null', () => {
		const data = {};
		const missingFields = [
			'email',
			'password',
			'locationName',
			'longitude',
			'latitude'
		];

		const cleanData = cleanUserData(data);
		for (const missingField of missingFields) {
			assert.include(Object.keys(cleanData), decamelize(missingField));
			assert.isNull(cleanData[decamelize(missingField)]);
		}
	});

	it('should remove invalid fields', () => {
		const data = {
			'otherField': 'somevalue'
		};

		const cleanData = cleanUserData(data);
		assert.notInclude(Object.keys(cleanData), 'otherField');
		assert.notInclude(Object.keys(cleanData), decamelize('otherField'));
	});
});