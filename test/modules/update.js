const	chai = require('chai'),
		assert = chai.assert,
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
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
		goodUser = await createUser({email: 'goodUser@example.com', password: 'goodpassword123'});
		badUser = await createUser({email: 'badUser@example.com', password: 'badpassword123'});
	});

	beforeEach(async () => {
		goodDress = await insert.intoTableValues('dress', {name: 'Good Dress', userId: goodUser.id});
		badDress1 = await insert.intoTableValues('dress', {name: 'Bad Dress', userId: badUser.id});
		badDress2 = await insert.intoTableValues('dress', {name: 'Worse Dress', userId: badUser.id});
	});

	describe('tableByIdWithValues method', () => {
		it('should throw a ForbiddenError and perform no further actions if table is not allowed', async () => {
			try {
				await update.tableByIdWithValues('app_user', badUser.id, {email: 'worstUser@example.com', password: 'worstpassword123'});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}

			const updatedBadUser = await selectUser.byId(badUser.id);
			assert.strictEqual(updatedBadUser.email, badUser.email);
		});

		it('should throw a ValidationError if the given name to update clashes with another article of the same type for the same user', async () => {
			try {
				await update.tableByIdWithValues('dress', badDress1.id, {name: badDress2.name, userId: badUser.id});
				assert.fail(0, 1, 'ValidationError was not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the given name to update matches another article of the same type owned by a different user', async () => {
			try {
				await update.tableByIdWithValues('dress', goodDress.id, {name: badDress1.name, userId: goodUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should return the updated version of the specified object', async () => {
			const newName = 'Updated Dress';
			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: newName, userId: goodUser.id});
			assert.strictEqual(updatedGoodDress.name, newName);
		});

		it('should return the updated object with camelCased keys', async () => {
			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: 'Updated Dress', userId: goodUser.id});

			assert.include(Object.keys(updatedGoodDress), 'maxTemp');
			assert.notInclude(Object.keys(updatedGoodDress), 'max_temp');
			assert.include(Object.keys(updatedGoodDress), 'userId');
			assert.notInclude(Object.keys(updatedGoodDress), 'user_id');
			assert.include(Object.keys(updatedGoodDress), 'rainOk');
			assert.notInclude(Object.keys(updatedGoodDress), 'rain_ok');
		});

		it('should remove any joins for ids that have been removed', async () => {
			const outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: goodUser.id});
			const outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: goodUser.id});
			await join.tableByIdToMany('dress', goodDress.id, {outerwears: [outerwear1.id, outerwear2.id]});

			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: 'Updated Dress', userId: goodUser.id, outerwears: []});

			assert.include(Object.keys(updatedGoodDress), 'outerwears');
			assert.isEmpty(updatedGoodDress.outerwears);

			const { rows: checkRows } = await query("SELECT * FROM dress_outerwear_join");
			assert.isEmpty(checkRows);
		});

		it('should add any joins for ids added', async () => {
			const outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: goodUser.id});
			const outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: goodUser.id});

			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: 'Updated Dress', userId: goodUser.id, outerwears: [outerwear1.id, outerwear2.id]});

			assert.include(Object.keys(updatedGoodDress), 'outerwears');
			outwearIds = updatedGoodDress.outerwears.map(e => e.id);
			assert.include(outwearIds, outerwear1.id);
			assert.include(outwearIds, outerwear2.id);

			const { rows: checkRows } = await query("SELECT * FROM dress_outerwear_join");
			assert.strictEqual(checkRows.length, 2);
		});

		it('should handle a mix of removed and added ids', async () => {
			const outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: goodUser.id});
			const outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: goodUser.id});
			await join.tableByIdToTableById('dress', goodDress.id, 'outerwear', outerwear1.id);

			const updatedGoodDress = await update.tableByIdWithValues('dress', goodDress.id, {name: 'Updated Dress', userId: goodUser.id, outerwears: [outerwear2.id]});

			assert.include(Object.keys(updatedGoodDress), 'outerwears');
			outwearIds = updatedGoodDress.outerwears.map(e => e.id);
			assert.notInclude(outwearIds, outerwear1.id);
			assert.include(outwearIds, outerwear2.id);

			const { rows: checkRows } = await query("SELECT * FROM dress_outerwear_join");
			assert.strictEqual(checkRows.length, 1);
		});
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});