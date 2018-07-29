const	chai = require('chai'),
		assert = chai.assert,
		getJoinTable = require('../../modules/get-join-table');


describe('Get Join Table module', () => {
	it('should throw a ValidationError if the table pair is invalid', () => {
		try {
			getJoinTable('dress', 'pants');
			assert.fail(0, 1, 'Error not thrown');
		} catch (err) {
			if (err.name === 'AssertionError')
				throw err;
			assert.strictEqual(err.name, 'ValidationError');
		}
	});

	it('should return the correct joinTable regardless of tablePair ordering', () => {
		assert.strictEqual(getJoinTable('shirt', 'pants'), 'shirt_pants_join');
		assert.strictEqual(getJoinTable('pants', 'shirt'), 'shirt_pants_join');

		assert.strictEqual(getJoinTable('shirt', 'outerwear'), 'shirt_outerwear_join');
		assert.strictEqual(getJoinTable('outerwear', 'shirt'), 'shirt_outerwear_join');

		assert.strictEqual(getJoinTable('pants', 'outerwear'), 'pants_outerwear_join');
		assert.strictEqual(getJoinTable('outerwear', 'pants'), 'pants_outerwear_join');

		assert.strictEqual(getJoinTable('dress', 'outerwear'), 'dress_outerwear_join');
		assert.strictEqual(getJoinTable('outerwear', 'dress'), 'dress_outerwear_join');

		assert.strictEqual(getJoinTable('outerwear', 'outerwear'), 'outerwear_outerwear_join');
	})
});