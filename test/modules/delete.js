const	chai = require('chai'),
		assert = chai.assert,
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
		sqlDelete = require('../../modules/delete'),
		insert = require('../../modules/insert'),
		select = require('../../modules/select'),
		createUser = require('../../modules/create-user'),
		selectUser = require('../../modules/select-user'),
		join = require('../../modules/join'),
		query = require('../../modules/query');


describe('Delete module', () => {
	let user;
	let coat;

	before(async () => {
		user = await createUser({username: 'user', password: 'password'});
	});

	beforeEach(async () => {
		coat = await insert.intoTableValues('outerwear', {name: 'Coat', ownerId: user.id});
	});

	describe('fromTableById method', () => {
		it('should return throw a ForbiddenError and perform no further action if table is not allowed', async () => {
			try {
				await sqlDelete.fromTableById('app_user', user.id);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
			const userCheck = await selectUser.byId(user.id);
			assert.isNotNull(userCheck);
		});

		it('should not throw an error if no object with the given id exists', async () => {
			try {
				await sqlDelete.fromTableById('outerwear', coat.id + 100);
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
		});

		it('should delete the specified object if the table and id are valid', async () => {
			await sqlDelete.fromTableById('outerwear', coat.id);

			try {
				await select.fromTableById('outerwear', coat.id);
				assert.fail(0, 1, 'Object not deleted');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
			}
		});

		it('should delete all joins fo the specified object', async () => {
			const shirt1 = await insert.intoTableValues('shirt', {name: 'shirt1', ownerId: user.id});
			const shirt2 = await insert.intoTableValues('shirt', {name: 'shirt2', ownerId: user.id});
			const pants1 = await insert.intoTableValues('pants', {name: 'pants1', ownerId: user.id});
			const pants2 = await insert.intoTableValues('pants', {name: 'pants2', ownerId: user.id});
			const dress1 = await insert.intoTableValues('dress', {name: 'dress1', ownerId: user.id});
			const dress2 = await insert.intoTableValues('dress', {name: 'dress2', ownerId: user.id});
			const outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', ownerId: user.id});
			const outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', ownerId: user.id});

			await join.tableByIdToMany('outerwear', coat.id, {shirts: [shirt1.id, shirt2.id], pants: [pants1.id, pants2.id], dresses: [dress1.id, dress2.id], outerwears: [outerwear1.id, outerwear2.id]});

			await sqlDelete.fromTableById('outerwear', coat.id);

			const { rows: checkShirtsRows } = await query("SELECT * FROM shirt_outerwear_join");
			assert.isEmpty(checkShirtsRows);
			const { rows: checkPantsRows } = await query("SELECT * FROM pants_outerwear_join");
			assert.isEmpty(checkPantsRows);
			const { rows: checkDressesRows } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(checkDressesRows);
			const { rows: checkOuterwearsRows } = await query("SELECT * FROM outerwear_outerwear_join");
			assert.isEmpty(checkOuterwearsRows);
		})
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	})
});