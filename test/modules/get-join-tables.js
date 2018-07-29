const	chai = require('chai'),
		assert = chai.assert,
		getJoinTables = require('../../modules/get-join-tables');


describe('Get Join Table module', () => {
	describe('forPair method', () => {
		it('should throw a ValidationError if the table pair is invalid', () => {
			try {
				getJoinTables.forPair('dress', 'pants');
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should return the correct joinTable regardless of tablePair ordering', () => {
			assert.strictEqual(getJoinTables.forPair('shirt', 'pants'), 'shirt_pants_join');
			assert.strictEqual(getJoinTables.forPair('pants', 'shirt'), 'shirt_pants_join');

			assert.strictEqual(getJoinTables.forPair('shirt', 'outerwear'), 'shirt_outerwear_join');
			assert.strictEqual(getJoinTables.forPair('outerwear', 'shirt'), 'shirt_outerwear_join');

			assert.strictEqual(getJoinTables.forPair('pants', 'outerwear'), 'pants_outerwear_join');
			assert.strictEqual(getJoinTables.forPair('outerwear', 'pants'), 'pants_outerwear_join');

			assert.strictEqual(getJoinTables.forPair('dress', 'outerwear'), 'dress_outerwear_join');
			assert.strictEqual(getJoinTables.forPair('outerwear', 'dress'), 'dress_outerwear_join');

			assert.strictEqual(getJoinTables.forPair('outerwear', 'outerwear'), 'outerwear_outerwear_join');
		});
	});

	describe('forTable method', () => {
		it('should throw a ValidationError if the table is not for an article', () => {
			try {
				getJoinTables.forTable('app_user');
				assert.fail(0, 1, 'Error was not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should return the correct joinTables for the given table', () => {
			assert.include(getJoinTables.forTable('shirt'), 'shirt_pants_join');
			assert.include(getJoinTables.forTable('shirt'), 'shirt_outerwear_join');

			assert.include(getJoinTables.forTable('pants'), 'shirt_pants_join');
			assert.include(getJoinTables.forTable('pants'), 'pants_outerwear_join');

			assert.include(getJoinTables.forTable('dress'), 'dress_outerwear_join');

			assert.include(getJoinTables.forTable('outerwear'), 'shirt_outerwear_join');
			assert.include(getJoinTables.forTable('outerwear'), 'pants_outerwear_join');
			assert.include(getJoinTables.forTable('outerwear'), 'dress_outerwear_join');
			assert.include(getJoinTables.forTable('outerwear'), 'outerwear_outerwear_join');
		});
	});
});