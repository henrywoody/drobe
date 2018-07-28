const	chai = require('chai'),
		assert = chai.assert,
		update = require('../../modules/update'),
		select = require('../../modules/select'),
		insert = require('../../modules/insert'),
		createUser = require('../../modules/create-user'),
		selectUser = require('../../modules/select-user'),
		query = require('../../modules/query');


describe('Update module', () => {
	let goodUser, badUser;
	let goodDress, badDress1, badDress2;
	
	before(async () => {
		goodUser = await createUser({username: 'goodUser', password: 'goodpassword123'});
		badUser = await createUser({username: 'badUser', password: 'badpassword123'});
	});

	describe('tableByIdWithValues method', () => {
		beforeEach(async () => {
			goodDress = await insert.intoTableValues('dress', {name: 'Good Dress', ownerId: goodUser.id});
			badDress1 = await insert.intoTableValues('dress', {name: 'Bad Dress', ownerId: badUser.id});
			badDress2 = await insert.intoTableValues('dress', {name: 'Worse Dress', ownerId: badUser.id});
		});

		it('should return null if table is not allowed and not perform any other actions', async () => {
			const response = await update.tableByIdWithValues('app_user', badUser.id, {username: 'worstUser', password: 'worstpassword123'});
			assert.isNull(response);

			const updatedBadUser = await selectUser.byId(badUser.id);
			assert.strictEqual(updatedBadUser.username, badUser.username);
		});

		it('should throw a ValidationError if the given name to update clashes with another article of the same type for the same user', async () => {
			try {
				await update.tableByIdWithValues('dress', badDress1.id, {name: badDress2.name, ownerId: badUser.id});
				assert.fail(0, 1, 'ValidationError was not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the given name to update matches another article of the same type owned by a different user', async () => {
			try {
				await update.tableByIdWithValues('dress', goodDress.id, {name: badDress1.name, ownerId: goodUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should return the updated version of the specified object', async () => {
			const newName = 'Updated Dress';
			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: newName, ownerId: goodUser.id});
			assert.strictEqual(updatedGoodDress.name, newName);
		});

		it('should return the updated object with camelCased keys', async () => {
			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: 'Updated Dress', ownerId: goodUser.id});

			assert.include(Object.keys(updatedGoodDress), 'maxTemp');
			assert.notInclude(Object.keys(updatedGoodDress), 'max_temp');
			assert.include(Object.keys(updatedGoodDress), 'ownerId');
			assert.notInclude(Object.keys(updatedGoodDress), 'owner_id');
			assert.include(Object.keys(updatedGoodDress), 'rainOk');
			assert.notInclude(Object.keys(updatedGoodDress), 'rain_ok');
		});

		afterEach(async () => {
			await query("DELETE FROM dress *");
		});
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});