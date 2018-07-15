const	chai = require('chai'),
		assert = chai.assert,
		camelCaseKeys = require('../../modules/camel-case-keys');

describe('Camel Case Keys module', () => {
	it('should change the keys of the given object to camelCase', () => {
		const obj = {
			some_key: 'nice',
			another_key: 100,
			and_a_third: true
		};

		const camelCasedObj = camelCaseKeys(obj);

		assert.deepEqual(Object.keys(camelCasedObj), ['someKey', 'anotherKey', 'andAThird']);
	});

	it('should leave the values of the given object intact', () => {
		const obj = {
			some_key: 'nice',
			another_key: 100,
			and_a_third: true
		};

		const camelCasedObj = camelCaseKeys(obj);

		assert.deepEqual(Object.values(camelCasedObj), Object.values(obj));
	});
});