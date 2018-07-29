const	chai = require('chai'),
		assert = chai.assert,
		unjoin = require('../../modules/unjoin'),
		createUser = require('../../modules/create-user'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		join = require('../../modules/join');


describe('Unjoin module', () => {
	let user;

	before(async () => {
		user = await createUser({username: 'user', password: 'pass'});
	});

	describe('tableIdToTableId method', () => {
		let shirt, pants, dress, jacket, sweater;

		beforeEach(async () => {
			shirt = await insert.intoTableValues('shirt', {name: 'good shirt', ownerId: user.id});
			pants = await insert.intoTableValues('pants', {name: 'good pants', ownerId: user.id});
			dress = await insert.intoTableValues('dress', {name: 'good dress', ownerId: user.id});
			jacket = await insert.intoTableValues('outerwear', {name: 'good jacket', ownerId: user.id});
			sweater = await insert.intoTableValues('outerwear', {name: 'good sweater', ownerId: user.id});

			await Promise.all([
				join.tableIdToTableId('shirt', shirt.id, 'pants', pants.id),
				join.tableIdToTableId('shirt', shirt.id, 'outerwear', jacket.id),
				join.tableIdToTableId('pants', pants.id, 'outerwear', sweater.id),
				join.tableIdToTableId('dress', dress.id, 'outerwear', jacket.id),
				join.tableIdToTableId('outerwear', jacket.id, 'outerwear', sweater.id)
			]);
		});

		it('should throw an ValidationError if table combination is not valid', async () => {
			try {
				await unjoin.tableIdToTableId('dress', dress.id, 'pants', pants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the specified join does not exist', async () => {
			try {
				unjoin.tableIdToTableId('shirt', shirt.id, 'outerwear', sweater.id);
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
		});

		it('should delete the specified join if it does exist', async () => {
			await Promise.all([
				unjoin.tableIdToTableId('shirt', shirt.id, 'pants', pants.id),
				unjoin.tableIdToTableId('shirt', shirt.id, 'outerwear', jacket.id),
				unjoin.tableIdToTableId('pants', pants.id, 'outerwear', sweater.id),
				unjoin.tableIdToTableId('dress', dress.id, 'outerwear', jacket.id),
				unjoin.tableIdToTableId('outerwear', jacket.id, 'outerwear', sweater.id)
			]);

			const { rows: rows1 } = await query("SELECT * FROM shirt_pants_join");
			assert.isEmpty(rows1);

			const { rows: rows2 } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(rows2);

			const { rows: rows3 } = await query("SELECT * FROM pants_outerwear_join");
			assert.isEmpty(rows3);

			const { rows: rows4 } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(rows4);

			const { rows: rows5 } = await query("SELECT * FROM outerwear_outerwear_join");
			assert.isEmpty(rows5);
		});

		afterEach(async () => {
			// NOTE: these need to be two separate Promise.alls because joins must be deleted before articles for CASCADING in SQL
			await Promise.all([
				query("DELETE FROM dress_outerwear_join *"),
				query("DELETE FROM outerwear_outerwear_join *"),
				query("DELETE FROM pants_outerwear_join *"),
				query("DELETE FROM shirt_outerwear_join *"),
				query("DELETE FROM shirt_pants_join *")
			]);
			await Promise.all([
				query("DELETE FROM shirt *"),
				query("DELETE FROM pants *"),
				query("DELETE FROM outerwear *"),
				query("DELETE FROM dress *")
			]);
		});
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	})
})