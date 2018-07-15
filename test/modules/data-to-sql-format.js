const	chai = require('chai'),
		assert = chai.assert,
		dataToSQL = require('../../modules/data-to-sql-format');

describe('Data To SQL Format module', () => {
	it('should work as expected', () => {
		const data = {
			field1: 'nice',
			field2: 100,
			field3: true
		}

		const { columns, queryValueSQLVars, queryValues } = dataToSQL(data);

		assert.strictEqual(columns, 'field1, field2, field3');
		assert.strictEqual(queryValueSQLVars, '$1, $2, $3');
		assert.deepEqual(queryValues, ['nice', 100, true]);
	});
});
