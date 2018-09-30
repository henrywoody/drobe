const	chai = require('chai'),
		assert = chai.assert,
		unjoin = require('../../modules/unjoin'),
		createUser = require('../../modules/create-user'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		join = require('../../modules/join');


describe('Unjoin module', () => {
	let user;
	let shirt, pants, dress, jacket, sweater;

	before(async () => {
		user = await createUser({email: 'user@example.com', password: 'pass'});
	});

	beforeEach(async () => {
		shirt = await insert.intoTableValues('shirt', {name: 'good shirt', userId: user.id});
		pants = await insert.intoTableValues('pants', {name: 'good pants', userId: user.id});
		dress = await insert.intoTableValues('dress', {name: 'good dress', userId: user.id});
		jacket = await insert.intoTableValues('outerwear', {name: 'good jacket', userId: user.id});
		sweater = await insert.intoTableValues('outerwear', {name: 'good sweater', userId: user.id});

		await Promise.all([
			join.tableByIdToTableById('shirt', shirt.id, 'pants', pants.id),
			join.tableByIdToTableById('shirt', shirt.id, 'outerwear', jacket.id),
			join.tableByIdToTableById('pants', pants.id, 'outerwear', sweater.id),
			join.tableByIdToTableById('dress', dress.id, 'outerwear', jacket.id),
			join.tableByIdToTableById('outerwear', jacket.id, 'outerwear', sweater.id)
		]);
	});

	describe('tableByIdToTableById method', () => {
		it('should throw an ValidationError if table combination is not valid', async () => {
			try {
				await unjoin.tableByIdToTableById('dress', dress.id, 'pants', pants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the specified join does not exist', async () => {
			try {
				unjoin.tableByIdToTableById('shirt', shirt.id, 'outerwear', sweater.id);
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
		});

		it('should delete the specified join if it does exist', async () => {
			await Promise.all([
				unjoin.tableByIdToTableById('shirt', shirt.id, 'pants', pants.id),
				unjoin.tableByIdToTableById('shirt', shirt.id, 'outerwear', jacket.id),
				unjoin.tableByIdToTableById('pants', pants.id, 'outerwear', sweater.id),
				unjoin.tableByIdToTableById('dress', dress.id, 'outerwear', jacket.id),
				unjoin.tableByIdToTableById('outerwear', jacket.id, 'outerwear', sweater.id)
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
	});

	describe('tableByIdToMany method', () => {
		it('should throw a ValidationError if any table combination is not valid', async () => {
			try {
				await unjoin.tableByIdToMany('dress', dress.id, {outerwears: [jacket.id], pants: [pants.id]});
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if any of the joins do not exist', async () => {
			try {
				await unjoin.tableByIdToMany('shirt', shirt.id, {outerwears: [jacket.id, sweater.id]});
			} catch (err) {
				assert.fail('An error was thrown');
			}
		});

		it('should delete all the joins specified', async () => {
			await unjoin.tableByIdToMany('pants', pants.id, {shirts: [shirt.id], outerwears: [sweater.id]});

			const { rows: rows1 } = await query("SELECT * FROM shirt_pants_join");
			assert.isEmpty(rows1);

			const { rows: rows2 } = await query("SELECT * FROM pants_outerwear_join");
			assert.isEmpty(rows2);


			await unjoin.tableByIdToMany('outerwear', jacket.id, {shirts: [shirt.id], dresses: [dress.id], outerwears: [sweater.id]});

			const { rows: rows3 } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(rows3);

			const { rows: rows4 } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(rows4);

			const { rows: rows5 } = await query("SELECT * FROM outerwear_outerwear_join");
			assert.isEmpty(rows5);
		});
	});

	describe('allForTableById method', () => {
		it('should not throw an error if the given object has no joins', async () => {
			otherShirt = await insert.intoTableValues('shirt', {name: 'another shirt', userId: user.id});
			try {
				await unjoin.allForTableById('shirt', otherShirt.id);
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
		});

		it('should delete all the joins of the given object', async () => {
			await unjoin.allForTableById('pants', pants.id);

			const { rows: rows1 } = await query("SELECT * FROM shirt_pants_join");
			assert.isEmpty(rows1);

			const { rows: rows2 } = await query("SELECT * FROM pants_outerwear_join");
			assert.isEmpty(rows2);

			await unjoin.allForTableById('outerwear', jacket.id);

			const { rows: rows3 } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(rows3);

			const { rows: rows4 } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(rows4);

			const { rows: rows5 } = await query("SELECT * FROM outerwear_outerwear_join");
			assert.isEmpty(rows5);
		});
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

	after(async () => {
		await query("DELETE FROM app_user *");
	});
})