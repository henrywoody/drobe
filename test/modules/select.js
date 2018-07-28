const	chai = require('chai'),
		assert = chai.assert,
		insert = require('../../modules/insert'),
		select = require('../../modules/select'),
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user');

describe('Select module', () => {
	let goodUser, badUser;
	let goodShirt1, goodShirt2, goodShirt3, goodPants, badShirt;

	before(async () => {
		// set up users
		goodUser = await createUser({username: 'good_username', password: 'goodpassword123'});
		badUser = await createUser({username: 'bad_username', password: 'badpassword123'});

		goodShirt1 = await insert.intoTableValues('shirt', {name: 'Good Shirt', ownerId: goodUser.id});
		goodShirt2 = await insert.intoTableValues('shirt', {name: 'Better Shirt', ownerId: goodUser.id});
		goodShirt3 = await insert.intoTableValues('shirt', {name: 'Best Shirt', ownerId: goodUser.id});
		goodPants = await insert.intoTableValues('pants', {name: 'Good Pants', ownerId: goodUser.id});
		badShirt = await insert.intoTableValues('shirt', {name: 'Bad Shirt', ownerId: badUser.id});
	});
	
	describe('fromTableByUser method', () => {
		it ('should return null if the given table is not allowed', async () => {
			const users = await select.fromTableByUser('app_user', goodUser.id);
			
			assert.isNull(users);
		});

		it('should return all articles in the table owned by the user and only articles in that table owned by that user', async () => {
			const shirts = await select.fromTableByUser('shirt', goodUser.id);

			assert.strictEqual(shirts.length, 3);
			assert.deepEqual(shirts, [goodShirt1, goodShirt2, goodShirt3]);
			assert.notInclude(shirts, badShirt);
			assert.notInclude(shirts, goodPants);
		});

		it('should camelCase the keys of the returned objects', async () => {
			const shirts = await select.fromTableByUser('shirt', goodUser.id);
			const exampleKeys = Object.keys(shirts[0]);
			
			assert.include(exampleKeys, 'maxTemp');
			assert.notInclude(exampleKeys, 'max_temp');
			assert.include(exampleKeys, 'ownerId');
			assert.notInclude(exampleKeys, 'owner_id');
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
		it ('should return null if the given table is not allowed', async () => {
			const user = await select.fromTableById('app_user', goodUser.id);
			
			assert.isNull(user);
		});

		it('should return the requested item', async () => {
			const shirt = await select.fromTableById('shirt', goodShirt1.id);

			assert.strictEqual(shirt.id, goodShirt1.id);
			assert.strictEqual(shirt.name, goodShirt1.name);
			assert.strictEqual(shirt.ownerId, goodShirt1.ownerId);
		});

		it('should camelCase the keys of the returned object', async () => {
			const shirt = await select.fromTableById('shirt', goodShirt1.id);
			const keys = Object.keys(shirt);
			
			assert.include(keys, 'maxTemp');
			assert.notInclude(keys, 'max_temp');
			assert.include(keys, 'ownerId');
			assert.notInclude(keys, 'owner_id');
			assert.include(keys, 'rainOk');
			assert.notInclude(keys, 'rain_ok');
		});

		it('should return null if no item with id in table is found', async () => {
			const response = await select.fromTableById('dress', 1);
			assert.isNull(response);
		});
	});



	after(async () => {
		await query("DELETE FROM app_user *");
		await query("DELETE FROM shirt *");
		await query("DELETE FROM pants *");
	})
});