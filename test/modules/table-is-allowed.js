const	chai = require('chai'),
		assert = chai.assert,
		tableIsAllowed = require('../../modules/table-is-allowed');

describe('Table Is Allowed module', () => {
	it('should return false for invalid or not allowed tables', () => {
		for (const table of ['app_user', 'something_else', 'idk']) {
			const isAllowed = tableIsAllowed(table);
			assert.isFalse(isAllowed);
		}
	});

	it('should return true for an allowed table', () => {
		for (const table of ['article', 'shirt', 'pants', 'dress', 'outerwear']) {
			const isAllowed = tableIsAllowed(table);
			assert.isTrue(isAllowed);
		}
	});
});