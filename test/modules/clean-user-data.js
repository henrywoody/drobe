const	chai = require('chai'),
		assert = chai.assert,
		cleanUserData = require('../../modules/clean-user-data'),
		camelCase = require('camelcase'),
		decamelize = require('decamelize');

describe('Clean User Data module', () => {
	it('should keep all the data for valid keys', () => {
		const data = {
			email: 'test@example.com',
			facebookId: 'fb12345',
			googleId: 'google12345',
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
			'facebookId',
			'googleId',
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

	it('should raise an InvalidEmailError if the given email is invalid', () => {
		const data = {
			email: 'notanemail',
			facebookId: 'fb12345',
			googleId: 'google12345',
			password: 'goodpassword1',
			locationName: 'Good Town, USA',
			longitude: -115.5,
			latitude: 35.0
		};

		try {
			cleanUserData(data);
			assert.fail(0,1,'No error was thrown');
		} catch (err) {
			if (err.name === 'AssertionError') {
				throw err;
			}
			assert.strictEqual(err.name, 'InvalidEmailError');
		}
	});

	it('should not raise an InvalidEmailError if no email is given', () => {
		cleanUserData({
			locationName: 'Good Town, USA',
			longitude: -115.5,
			latitude: 35.0
		});

		cleanUserData({
			email: '',
			locationName: 'Good Town, USA',
			longitude: -115.5,
			latitude: 35.0
		});
	});
});