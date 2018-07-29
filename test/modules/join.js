const	chai = require('chai'),
		assert = chai.assert,
		join = require('../../modules/join'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user');


describe ('Join module', () => {
	let goodUser, badUser;

	before(async () => {
		goodUser = await createUser({username: 'goodUser', password: 'password'});
		badUser = await createUser({username: 'badUser', password: 'password'});
	});

	describe('tableIdToTableId method', () => {
		let shirt, pants, jacket, sweater, dress, badPants;

		beforeEach(async () => {
			shirt = await insert.intoTableValues('shirt', {name: 'good shirt', ownerId: goodUser.id});
			pants = await insert.intoTableValues('pants', {name: 'good pants', ownerId: goodUser.id});
			jacket = await insert.intoTableValues('outerwear', {name: 'good jacket', ownerId: goodUser.id});
			sweater = await insert.intoTableValues('outerwear', {name: 'good sweater', ownerId: goodUser.id});
			dress = await insert.intoTableValues('dress', {name: 'good dress', ownerId: goodUser.id});
			badPants = await insert.intoTableValues('pants', {name: 'bad pants', ownerId: badUser.id});
		});

		it('should throw an ValidationError if table combination is not valid', async () => {
			try {
				await join.tableIdToTableId('dress', dress.id, 'pants', pants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw an ValidationError and not create a join between two objects owned by different users', async () => {
			try {
				await join.tableIdToTableId('shirt', shirt.id, 'pants', badPants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a NotFoundError if either of the object ids is invalid', async () => {
			try {
				await join.tableIdToTableId('shirt', shirt.id + 100, 'pants', badPants.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}
		});

		it('should create a join between a valid pair of objects and return the join with camelCased keys', async () => {
			let joinObj;

			joinObj = await join.tableIdToTableId('shirt', shirt.id, 'pants', pants.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.pantsId, pants.id);

			joinObj = await join.tableIdToTableId('shirt', shirt.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);

			joinObj = await join.tableIdToTableId('pants', pants.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);

			joinObj = await join.tableIdToTableId('outerwear', jacket.id, 'outerwear', sweater.id);
			assert.strictEqual(joinObj.aOuterwearId, jacket.id);
			assert.strictEqual(joinObj.bOuterwearId, sweater.id);

			joinObj = await join.tableIdToTableId('dress', dress.id, 'outerwear', sweater.id);
			assert.strictEqual(joinObj.dressId, dress.id);
			assert.strictEqual(joinObj.outerwearId, sweater.id);
		});

		it('should create a join between a valid pair of objects *regardless of the order given* and return the join with camelCased keys', async () => {
			let joinObj;

			joinObj = await join.tableIdToTableId('pants', pants.id, 'shirt', shirt.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			
			joinObj = await join.tableIdToTableId('outerwear', jacket.id, 'shirt', shirt.id);
			assert.strictEqual(joinObj.shirtId, shirt.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);
			
			joinObj = await join.tableIdToTableId('outerwear', jacket.id, 'pants', pants.id);
			assert.strictEqual(joinObj.pantsId, pants.id);
			assert.strictEqual(joinObj.outerwearId, jacket.id);
			
			joinObj = await join.tableIdToTableId('outerwear', sweater.id, 'outerwear', jacket.id);
			assert.strictEqual(joinObj.aOuterwearId, sweater.id);
			assert.strictEqual(joinObj.bOuterwearId, jacket.id);
			
			joinObj = await join.tableIdToTableId('outerwear', sweater.id, 'dress', dress.id);
			assert.strictEqual(joinObj.dressId, dress.id);
			assert.strictEqual(joinObj.outerwearId, sweater.id);
		});

		it('should not throw an error but return null if asked to create a join that already exists', async () => {
			await join.tableIdToTableId('pants', pants.id, 'shirt', shirt.id);
			const joinObj = await join.tableIdToTableId('pants', pants.id, 'shirt', shirt.id);

			assert.isNull(joinObj);
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
	});
});