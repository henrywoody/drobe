const	chai = require('chai'),
		assert = chai.assert,
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user'),
		camelCaseKeys = require('../../modules/camel-case-keys');


describe('Insert module', () => {
	let goodUser, badUser;

	before(async () => {
		goodUser = await createUser({username: 'gooduser', password: 'goodpass123'});
		badUser = await createUser({username: 'baduser', password: 'badpass123'});
	});

	describe('intoTableValues method', () => {
		it('should throw a ForbiddenError if the given table is not valid', async () => {
			try {
				await insert.intoTableValues('app_user', {username: 'fakeuser', password: 'fakepass'});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});

		it('should throw a ValidationError if the given article has no name', async () => {
			try {
				await insert.intoTableValues('shirt', {ownerId: badUser.id});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if there is already an article of the same type with the same name for the same user', async () => {
			await insert.intoTableValues('shirt', {name: 'Nice Shirt', ownerId: badUser.id});
			try {
				await insert.intoTableValues('shirt', {name: 'Nice Shirt', ownerId: badUser.id});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if the given rating on the article is above 5 or below 1', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Nice Shirt', ownerId: badUser.id, rating: 100});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}

			try {
				await insert.intoTableValues('shirt', {name: 'Bad Shirt', ownerId: badUser.id, rating: -10});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if the given an invalid specificType for an outerwear', async () => {
			try {
				await insert.intoTableValues('outerwear', {name: 'Not a coat', ownerId: badUser.id, specificType: 'somethingElse'});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the given name matches an article of a differnt type for the same owner', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Favorite', ownerId: goodUser.id});
				await insert.intoTableValues('pants', {name: 'Favorite', ownerId: goodUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should not throw an error if the given name matches an article of a different owner', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Favorite', ownerId: goodUser.id});
				await insert.intoTableValues('shirt', {name: 'Favorite', ownerId: badUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should return the newly created article with camelCased keys', async () => {
			const coatData = {name: 'Favorite', ownerId: goodUser.id, description: 'the best', rating: 5, color: 'red', maxTemp: 100, minTemp: 70, rainOk: false, snowOk: false, specificType: 'jacket'};
			const newCoat = await insert.intoTableValues('outerwear', coatData);

			for (const key in coatData) {
				assert.strictEqual(newCoat[key], coatData[key]);
			}
		});

		afterEach(async () => {
			await query('DELETE FROM shirt *');
			await query('DELETE FROM pants *');
			await query('DELETE FROM outerwear *');
		});
	});

	after(async () => {
		await query('DELETE FROM app_user *');
	});
});