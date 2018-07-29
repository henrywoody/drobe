const	chai = require('chai'),
		assert = chai.assert,
		sqlDelete = require('../../modules/delete'),
		insert = require('../../modules/insert'),
		select = require('../../modules/select'),
		createUser = require('../../modules/create-user'),
		selectUser = require('../../modules/select-user'),
		query = require('../../modules/query');


describe('Delete module', () => {
	let user;

	before(async () => {
		user = await createUser({username: 'user', password: 'password'});
	});

	describe('fromTableById method', () => {
		let coat;

		beforeEach(async () => {
			coat = await insert.intoTableValues('outerwear', {name: 'Coat', ownerId: user.id});
		});

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

		it('should not throw an error if not object with the given id exists', async () => {
			try {
				await sqlDelete.fromTableById('outerwear', coat.id + 1);
			} catch (err) {
				assert.fail(0, 1, 'An error was thrown');
			}
		})

		it('should delete the specified object if the table and id are valid', async () => {
			await sqlDelete.fromTableById('outerwear', coat.id);

			try {
				await select.fromTableById('outerwear', coat.id);
				assert.fail(0, 1, 'Object not deleted');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
			}
		})

		afterEach(async () => {
			await query("DELETE FROM outerwear *");
		});
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	})
});