const	chai = require('chai'),
		assert = chai.assert,
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user'),
		camelCaseKeys = require('../../modules/camel-case-keys'),
		join = require('../../modules/join');


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
				await insert.intoTableValues('shirt', {userId: badUser.id});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if there is already an article of the same type with the same name for the same user', async () => {
			await insert.intoTableValues('shirt', {name: 'Nice Shirt', userId: badUser.id});
			try {
				await insert.intoTableValues('shirt', {name: 'Nice Shirt', userId: badUser.id});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if the given rating on the article is above 5 or below 1', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Nice Shirt', userId: badUser.id, rating: 100});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}

			try {
				await insert.intoTableValues('shirt', {name: 'Bad Shirt', userId: badUser.id, rating: -10});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should throw a ValidationError if the given an invalid specificKind for an outerwear', async () => {
			try {
				await insert.intoTableValues('outerwear', {name: 'Not a coat', userId: badUser.id, specificKind: 'somethingElse'});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should not throw an error if the given name matches an article of a differnt type for the same user', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Favorite', userId: goodUser.id});
				await insert.intoTableValues('pants', {name: 'Favorite', userId: goodUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should not throw an error if the given name matches an article of a different user', async () => {
			try {
				await insert.intoTableValues('shirt', {name: 'Favorite', userId: goodUser.id});
				await insert.intoTableValues('shirt', {name: 'Favorite', userId: badUser.id});
			} catch (err) {
				assert.fail(0, 1, 'Threw an error');
			}
		});

		it('should return the newly created article with camelCased keys', async () => {
			const coatData = {name: 'Favorite', userId: goodUser.id, description: 'the best', rating: 5, color: 'red', maxTemp: 100, minTemp: 70, rainOk: false, snowOk: false, specificKind: 'jacket'};
			const newCoat = await insert.intoTableValues('outerwear', coatData);

			for (const key in coatData) {
				assert.strictEqual(newCoat[key], coatData[key]);
			}
		});

		it('should create joins between given objects and return the nested objects', async () => {
			const shirt1 = await insert.intoTableValues('shirt', {name: 'shirt1', userId: goodUser.id});
			const shirt2 = await insert.intoTableValues('shirt', {name: 'shirt2', userId: goodUser.id});
			const pants1 = await insert.intoTableValues('pants', {name: 'pants1', userId: goodUser.id});
			const pants2 = await insert.intoTableValues('pants', {name: 'pants2', userId: goodUser.id});
			const dress1 = await insert.intoTableValues('dress', {name: 'dress1', userId: goodUser.id});
			const dress2 = await insert.intoTableValues('dress', {name: 'dress2', userId: goodUser.id});
			const outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: goodUser.id});
			const outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: goodUser.id});

			const sweaterData = {
				name: 'sweater',
				userId: goodUser.id,
				shirts: [shirt1.id, shirt2.id],
				pants: [pants1.id, pants2.id],
				dresses: [dress1.id, dress2.id],
				outerwears: [outerwear1.id, outerwear2.id]
			}
			const newSweater = await insert.intoTableValues('outerwear', sweaterData);

			assert.include(Object.keys(newSweater), 'shirts');
			shirtIds = newSweater.shirts.map(e => e.id);
			assert.include(shirtIds, shirt1.id);
			assert.include(shirtIds, shirt2.id);

			assert.include(Object.keys(newSweater), 'pants');
			pantsIds = newSweater.pants.map(e => e.id);
			assert.include(pantsIds, pants1.id);
			assert.include(pantsIds, pants2.id);

			assert.include(Object.keys(newSweater), 'dresses');
			dressIds = newSweater.dresses.map(e => e.id);
			assert.include(dressIds, dress1.id);
			assert.include(dressIds, dress2.id);

			assert.include(Object.keys(newSweater), 'outerwears');
			outerwearIds = newSweater.outerwears.map(e => e.id);
			assert.include(outerwearIds, outerwear1.id);
			assert.include(outerwearIds, outerwear2.id);
		});
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});