const	chai = require('chai'),
		assert = chai.assert,
		checkTableIsAllowed = require('../../modules/check-table-is-allowed');

describe('Check Table Is Allowed module', () => {
	it('should throw a ForbiddenError for invalid or not allowed tables', () => {
		for (const table of ['app_user', 'something_else', 'idk']) {
			try {
				checkTableIsAllowed(table);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		}
	});

	it('should return true for an allowed table', () => {
		for (const table of ['article', 'shirt', 'pants', 'dress', 'outerwear']) {
			const isAllowed = checkTableIsAllowed(table);
			assert.isTrue(isAllowed);
		}
	});
});