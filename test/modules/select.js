const	chai = require('chai'),
		assert = chai.assert,
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
		insert = require('../../modules/insert'),
		select = require('../../modules/select'),
		query = require('../../modules/query'),
		join = require('../../modules/join'),
		createUser = require('../../modules/create-user');


describe('Select module', () => {
	let goodUser, badUser;
	let goodShirt1, goodShirt2, goodShirt3, goodPants, badShirt;

	before(async () => {
		// set up users
		goodUser = await createUser({username: 'good_username', password: 'goodpassword123'});
		badUser = await createUser({username: 'bad_username', password: 'badpassword123'});
	});

	beforeEach(async () => {
		goodShirt1 = await insert.intoTableValues('shirt', {name: 'Good Shirt', userId: goodUser.id});
		goodShirt2 = await insert.intoTableValues('shirt', {name: 'Better Shirt', userId: goodUser.id});
		goodShirt3 = await insert.intoTableValues('shirt', {name: 'Best Shirt', userId: goodUser.id});
		goodPants = await insert.intoTableValues('pants', {name: 'Good Pants', userId: goodUser.id});
		badShirt = await insert.intoTableValues('shirt', {name: 'Bad Shirt', userId: badUser.id});

		await join.tableByIdToMany('pants', goodPants.id, {shirts: [goodShirt1.id, goodShirt2.id, goodShirt3.id]});
	});
	
	describe('fromTableByUser method', () => {
		it ('should throw a ForbiddenError if the given table is not allowed', async () => {
			try {
				await select.fromTableByUser('app_user', goodUser.id);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});

		it('should return all articles in the table owned by the user and only articles in that table owned by that user', async () => {
			const shirts = await select.fromTableByUser('shirt', goodUser.id);
			const shirtIds = shirts.map(e => e.id);
			
			assert.strictEqual(shirtIds.length, 3);
			assert.include(shirtIds, goodShirt1.id);
			assert.include(shirtIds, goodShirt2.id);
			assert.include(shirtIds, goodShirt3.id);
			assert.notInclude(shirtIds, badShirt.id);
			assert.notInclude(shirtIds, goodPants.id);
		});

		it('should camelCase the keys of the returned objects', async () => {
			const shirts = await select.fromTableByUser('shirt', goodUser.id);
			const exampleKeys = Object.keys(shirts[0]);
			
			assert.include(exampleKeys, 'maxTemp');
			assert.notInclude(exampleKeys, 'max_temp');
			assert.include(exampleKeys, 'userId');
			assert.notInclude(exampleKeys, 'user_id');
			assert.include(exampleKeys, 'rainOk');
			assert.notInclude(exampleKeys, 'rain_ok');
		});

		it('should return an empty array if no results are found', async () => {
			const dresses = await select.fromTableByUser('dress', goodUser.id);
			
			assert.isArray(dresses);
			assert.isEmpty(dresses);
		});
	});

	describe('fromTableById method', () => {
		it ('should throw a ForbiddenError if the given table is not allowed', async () => {
			try {
				await select.fromTableById('app_user', goodUser.id);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});

		it('should throw a NotFoundError if no item with id in table is found', async () => {
			try {
				await select.fromTableById('shirt', goodShirt1.id + 100);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}
		});

		it('should return the requested item', async () => {
			const shirt = await select.fromTableById('shirt', goodShirt1.id);

			assert.strictEqual(shirt.id, goodShirt1.id);
			assert.strictEqual(shirt.name, goodShirt1.name);
			assert.strictEqual(shirt.userId, goodShirt1.userId);
		});

		it('should camelCase the keys of the returned object', async () => {
			const shirt = await select.fromTableById('shirt', goodShirt1.id);
			const keys = Object.keys(shirt);
			
			assert.include(keys, 'maxTemp');
			assert.notInclude(keys, 'max_temp');
			assert.include(keys, 'userId');
			assert.notInclude(keys, 'user_id');
			assert.include(keys, 'rainOk');
			assert.notInclude(keys, 'rain_ok');
		});
	});

	describe('fromTableByIdWithJoins method', () => {
		it ('should throw a ForbiddenError if the given table is not allowed', async () => {
			try {
				await select.fromTableByIdWithJoins('app_user', goodUser.id);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});

		it('should throw a NotFoundError if no item with id in table is found', async () => {
			try {
				await select.fromTableByIdWithJoins('shirt', goodShirt1.id + 100);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}
		});

		it('should return the requested item with joined objects and empty arrays for any types with no joined objects', async () => {
			const pants = await select.fromTableByIdWithJoins('pants', goodPants.id);

			assert.strictEqual(pants.id, goodPants.id);
			assert.strictEqual(pants.name, goodPants.name);
			assert.strictEqual(pants.userId, goodPants.userId);

			assert.include(Object.keys(pants), 'shirts');
			assert.strictEqual(pants.shirts.length, 3);
			const shirtIds = pants.shirts.map(e => e.id);
			assert.include(shirtIds, goodShirt1.id);
			assert.include(shirtIds, goodShirt2.id);
			assert.include(shirtIds, goodShirt3.id);
			const shirtNames = pants.shirts.map(e => e.name);
			assert.include(shirtNames, goodShirt1.name);
			assert.include(shirtNames, goodShirt2.name);
			assert.include(shirtNames, goodShirt3.name);

			assert.include(Object.keys(pants), 'outerwears');
			assert.isEmpty(pants.outerwears);
		});

		it('should camelCase the keys of the returned object', async () => {
			const shirt = await select.fromTableByIdWithJoins('shirt', goodShirt1.id);
			const keys = Object.keys(shirt);
			
			assert.include(keys, 'maxTemp');
			assert.notInclude(keys, 'max_temp');
			assert.include(keys, 'userId');
			assert.notInclude(keys, 'user_id');
			assert.include(keys, 'rainOk');
			assert.notInclude(keys, 'rain_ok');
		});
	});

	describe('fromTablesByIds method', () => {
		it('should throw a ForbiddenError is any of the given tables is not allowed', async () => {
			try {
				await select.fromTablesByIds({shirts: [goodShirt1.id], app_user: [goodUser.id]});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});

		it('should throw a NotFoundError if any of the given ids is not valid (does not exist in table)', async () => {
			try {
				await select.fromTablesByIds({shirts: [goodShirt1.id, goodShirt2.id + 100, goodShirt3.id], pants: [goodPants.id]});
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'NotFoundError');
			}
		});

		it('should return an object of the same form that was given, but with objects instead of ids', async () => {
			const objects = await select.fromTablesByIds({shirts: [goodShirt1.id, goodShirt2.id, goodShirt3.id], pants: [goodPants.id]});
			assert.include(Object.keys(objects), 'shirts');
			assert.include(Object.keys(objects), 'pants');

			const objectIds = {shirts: objects.shirts.map(e => e.id), pants: objects.pants.map(e => e.id)};
			assert.include(objectIds.shirts, goodShirt1.id);
			assert.include(objectIds.shirts, goodShirt2.id);
			assert.include(objectIds.shirts, goodShirt3.id);
			assert.include(objectIds.pants, goodPants.id);
		});

		it('should camelCase the keys of all returned objects', async () => {
			const objects = await select.fromTablesByIds({shirts: [goodShirt1.id, goodShirt2.id, goodShirt3.id], pants: [goodPants.id]});
			
			assert.include(Object.keys(objects.shirts[0]), 'maxTemp');
			assert.notInclude(Object.keys(objects.shirts[0]), 'max_temp');
			assert.include(Object.keys(objects.shirts[0]), 'rainOk');
			assert.notInclude(Object.keys(objects.shirts[0]), 'rain_ok');

			assert.include(Object.keys(objects.shirts[1]), 'maxTemp');
			assert.notInclude(Object.keys(objects.shirts[1]), 'max_temp');
			assert.include(Object.keys(objects.shirts[1]), 'rainOk');
			assert.notInclude(Object.keys(objects.shirts[1]), 'rain_ok');

			assert.include(Object.keys(objects.pants[0]), 'maxTemp');
			assert.notInclude(Object.keys(objects.pants[0]), 'max_temp');
			assert.include(Object.keys(objects.pants[0]), 'rainOk');
			assert.notInclude(Object.keys(objects.pants[0]), 'rain_ok');
		});
	});

	describe('fromTableForUserAndTemp method', () => {
		it ('should throw a ForbiddenError if the given table is not allowed', async () => {
			try {
				await select.fromTableForUserAndTemp('app_user', goodUser.id, 100);
				assert.fail(0, 1, 'Error not thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ForbiddenError');
			}
		});
		
		it('should return all and only articles from that table owned by the user whose minTemp is below the given temp and maxTemp', async () => {
			hotShirt = await insert.intoTableValues('shirt', {name: 'Hot Shirt', userId: goodUser.id, maxTemp: 120, minTemp: 80});
			midShirt = await insert.intoTableValues('shirt', {name: 'Mid Shirt', userId: goodUser.id, maxTemp: 90, minTemp: 50});
			coldShirt = await insert.intoTableValues('shirt', {name: 'Cold Shirt', userId: goodUser.id, maxTemp: 60, minTemp:0});

			const hotResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, 85);
			const hotIds = hotResults.map(e => e.id);
			assert.include(hotIds, hotShirt.id);
			assert.include(hotIds, midShirt.id);
			assert.notInclude(hotIds, coldShirt.id);

			const midResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, 70);
			const midIds = midResults.map(e => e.id);
			assert.notInclude(midIds, hotShirt.id);
			assert.include(midIds, midShirt.id);
			assert.notInclude(midIds, coldShirt.id);

			const coldResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, 55);
			const coldIds = coldResults.map(e => e.id);
			assert.notInclude(coldIds, hotShirt.id);
			assert.include(coldIds, midShirt.id);
			assert.include(coldIds, coldShirt.id);

			// other users
			assert.notInclude(hotIds, badShirt.id);
			assert.notInclude(midIds, badShirt.id);
			assert.notInclude(coldIds, badShirt.id);
		});

		it('should interpret missing minTemp as -inf and missing maxTemp as inf', async () => {
			hotShirt = await insert.intoTableValues('shirt', {name: 'Hot Shirt', userId: goodUser.id, minTemp: 80});
			anyShirt = await insert.intoTableValues('shirt', {name: 'Any Shirt', userId: goodUser.id});
			coldShirt = await insert.intoTableValues('shirt', {name: 'Cold Shirt', userId: goodUser.id, maxTemp: 60});

			const hotResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, 150);
			const hotIds = hotResults.map(e => e.id);
			assert.include(hotIds, hotShirt.id);
			assert.include(hotIds, anyShirt.id);
			assert.notInclude(hotIds, coldShirt.id);

			const midResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, 70);
			const midIds = midResults.map(e => e.id);
			assert.notInclude(midIds, hotShirt.id);
			assert.include(midIds, anyShirt.id);
			assert.notInclude(midIds, coldShirt.id);

			const coldResults = await select.fromTableForUserAndTemp('shirt', goodUser.id, -20);
			const coldIds = coldResults.map(e => e.id);
			assert.notInclude(coldIds, hotShirt.id);
			assert.include(coldIds, anyShirt.id);
			assert.include(coldIds, coldShirt.id);

			// other users
			assert.notInclude(hotIds, badShirt.id);
			assert.notInclude(midIds, badShirt.id);
			assert.notInclude(coldIds, badShirt.id);
		});
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});