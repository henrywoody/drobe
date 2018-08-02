const	chai = require('chai'),
		assert = chai.assert,
		join = require('../../modules/join'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user');


describe ('Join module', () => {
	let goodUser, badUser;
	let shirt, pants, jacket, sweater, dress, badPants;

	before(async () => {
		goodUser = await createUser({username: 'goodUser', password: 'password'});
		badUser = await createUser({username: 'badUser', password: 'password'});
	});

	beforeEach(async () => {
		shirt = await insert.intoTableValues('shirt', {name: 'good shirt', userId: goodUser.id});
		pants = await insert.intoTableValues('pants', {name: 'good pants', userId: goodUser.id});
		jacket = await insert.intoTableValues('outerwear', {name: 'good jacket', userId: goodUser.id});
		sweater = await insert.intoTableValues('outerwear', {name: 'good sweater', userId: goodUser.id});
		dress = await insert.intoTableValues('dress', {name: 'good dress', userId: goodUser.id});
		badPants = await insert.intoTableValues('pants', {name: 'bad pants', userId: badUser.id});
	});

	describe('tableByIdToTableById method', () => {
		it('should throw a ValidationError if table combination is not valid', async () => {
			try {
				await join.tableByIdToTableById('dress', dress.id, 'pants', pants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError and not create a join between two objects owned by different users', async () => {
			try {
				await join.tableByIdToTableById('shirt', shirt.id, 'pants', badPants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a NotFoundError if either of the object ids is invalid', async () => {
			try {
				await join.tableByIdToTableById('shirt', shirt.id + 100, 'pants', badPants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}
		});

		it('should create a join between a valid pair of objects and return the join with camelCased keys', async () => {
			let joinObj;

			joinObj = await join.tableByIdToTableById('shirt', shirt.id, 'pants', pants.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.pantsId, pants.id);

			joinObj = await join.tableByIdToTableById('shirt', shirt.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);

			joinObj = await join.tableByIdToTableById('pants', pants.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);

			joinObj = await join.tableByIdToTableById('outerwear', jacket.id, 'outerwear', sweater.id);
			assert.strictEqual(joinObj.aOuterwearId, jacket.id);
			assert.strictEqual(joinObj.bOuterwearId, sweater.id);

			joinObj = await join.tableByIdToTableById('dress', dress.id, 'outerwear', sweater.id);
			assert.strictEqual(joinObj.dressId, dress.id);
			assert.strictEqual(joinObj.outerwearId, sweater.id);
		});

		it('should create a join between a valid pair of objects *regardless of the order given* and return the join with camelCased keys', async () => {
			let joinObj;

			joinObj = await join.tableByIdToTableById('pants', pants.id, 'shirt', shirt.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			
			joinObj = await join.tableByIdToTableById('outerwear', jacket.id, 'shirt', shirt.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);
			
			joinObj = await join.tableByIdToTableById('outerwear', jacket.id, 'pants', pants.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);
			
			joinObj = await join.tableByIdToTableById('outerwear', sweater.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.aOuterwearId, sweater.id);
			assert.strictEqual(joinObj.bOuterwearId, jacket.id);
			
			joinObj = await join.tableByIdToTableById('outerwear', sweater.id, 'dress', dress.id);
			assert.strictEqual(joinObj.dressId, dress.id);
			assert.strictEqual(joinObj.outerwearId, sweater.id);
		});

		it('should not throw an error but return null if asked to create a join that already exists', async () => {
			await join.tableByIdToTableById('pants', pants.id, 'shirt', shirt.id);
			const joinObj = await join.tableByIdToTableById('pants', pants.id, 'shirt', shirt.id);

			assert.isNull(joinObj);
		});
	});

	describe('tableByIdToMany method', () => {
		it('should throw a ValidationError and not create any joins if any of the table combinations is invalid', async () => {
			try {
				await join.tableByIdToMany('dress', dress.id, {outerwears: [jacket.id], shirts: [shirt.id]});
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}

			const { rows } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(rows);
		});

		it('should throw a ValidationError and not create any joins if any objects is owned by different users', async () => {
			try {
				await join.tableByIdToMany('shirt', shirt.id, {pants: [badPants.id], outerwears: [jacket.id]});
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}

			const { rows } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(rows);
		});

		it('should throw a NotFoundError and not create any joins if any of the object ids is invalid', async () => {
			try {
				await join.tableByIdToMany('shirt', shirt.id, {pants: [pants.id + 100], outerwears: [jacket.id, sweater.id]});
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}

			const { rows } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(rows);
		});

		it('should create joins between the main object and all other given objects and return the joins', async () => {
			const joins = await join.tableByIdToMany('shirt', shirt.id, {pants: [pants.id], outerwears: [jacket.id, sweater.id]});

			assert.include(joins.pants, pants.id);
			assert.include(joins.outerwears, jacket.id);
			assert.include(joins.outerwears, sweater.id);

			const { rows: rows1 } = await query("SELECT * FROM shirt_pants_join");
			assert.strictEqual(rows1.length, 1);
			const { rows: rows2 } = await query("SELECT * FROM shirt_outerwear_join");
			assert.strictEqual(rows2.length, 2);
		});

		it('should not throw an error if any join already exists', async () => {
			await join.tableByIdToTableById('shirt', shirt.id, 'outerwear', jacket.id);
			try {
				await join.tableByIdToMany('shirt', shirt.id, {pants: [pants.id], outerwears: [jacket.id, sweater.id]});
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
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
});