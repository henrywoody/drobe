const	chai = require('chai'),
		assert = chai.assert,
		separateNestedFields = require('../../modules/separate-nested-fields');


describe('Extract Nested Fields module', () => {
	it('should not throw an error if any nested fields are missing', () => {
		const nestedCleanData = {
			key1: 'value1',
			key2: 'value2'
		}
		try {
			separateNestedFields(cleanData);
		} catch (err) {
			assert.fail(0, 1, 'An error was thrown');
		}
	});

	it('should separate any nested fields and return them as an object as well as the cleanData less the nested fields as a separate object', () => {
		const nestedCleanData = {
			key1: 'value1',
			key2: 'value2',
			shirts: [1,2,3],
			pants: [1,2,3],
			dresses: [1,2,3],
			outerwears: [1,2,3]
		}
		const {cleanData, nestedData} = separateNestedFields(nestedCleanData);

		assert.strictEqual(cleanData.key1, nestedCleanData.key1);
		assert.strictEqual(cleanData.key2, nestedCleanData.key2);
		assert.notInclude(Object.keys(cleanData), 'shirts');
		assert.notInclude(Object.keys(cleanData), 'pants');
		assert.notInclude(Object.keys(cleanData), 'dresses');
		assert.notInclude(Object.keys(cleanData), 'outerwears');
		
		assert.strictEqual(nestedData.shirts, nestedCleanData.shirts);
		assert.strictEqual(nestedData.pants, nestedCleanData.pants);
		assert.strictEqual(nestedData.dresses, nestedCleanData.dresses);
		assert.strictEqual(nestedData.outerwears, nestedCleanData.outerwears);
		assert.notInclude(Object.keys(nestedData), 'key1');
		assert.notInclude(Object.keys(nestedData), 'key2');
	});
});