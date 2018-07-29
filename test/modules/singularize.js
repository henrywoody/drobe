const	chai = require('chai'),
		assert = chai.assert,
		singularize = require('../../modules/singularize');



describe('Singularize module', () => {
	it('should singularize as expected', () => {
		assert.strictEqual(singularize('shirts'), 'shirt');
		assert.strictEqual(singularize('shirt'), 'shirt');

		assert.strictEqual(singularize('pants'), 'pants');

		assert.strictEqual(singularize('dresses'), 'dress');
		assert.strictEqual(singularize('dress'), 'dress');

		assert.strictEqual(singularize('outerwears'), 'outerwear');
		assert.strictEqual(singularize('outerwear'), 'outerwear');
	});
});