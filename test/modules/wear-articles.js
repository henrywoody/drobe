const	chai = require('chai'),
		assert = chai.assert,
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
		insert = require('../../modules/insert'),
		select = require('../../modules/select'),
		createUser = require('../../modules/create-user'),
		query = require('../../modules/query'),
		wearArticles = require('../../modules/wear-articles');

chai.use(require('chai-datetime'));


describe('Wear Articles module', () => {
	let user;

	before(async () => {
		user = await createUser({email: 'user@example.com', password: 'password'});
	});

	beforeEach(async () => {
		const lastWorn = new Date('2018-01-01');

		shirt = await insert.intoTableValues('shirt', {name: 'shirt', userId: user.id, lastWorn: lastWorn});
		pants = await insert.intoTableValues('pants', {name: 'pants', userId: user.id, lastWorn: lastWorn});
		dress = await insert.intoTableValues('dress', {name: 'dress', userId: user.id, lastWorn: lastWorn});
		outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: user.id, lastWorn: lastWorn});
		outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: user.id, lastWorn: lastWorn});
	});

	it('should throw a ForbiddenError if a table is given that is not allowed', async () => {
		try {
			await wearArticles({app_user: user.id});
			assert.fail(0, 1, 'No error was thrown');
		} catch (err) {
			if (err.name === 'AssertionError')
				throw err;
			assert.strictEqual(err.name, 'ForbiddenError');
		}
	});

	it('should throw a NotFoundError if any id for any article is not found', async () => {
		try {
			await wearArticles({shirt: shirt.id, pants: pants.id, dress: dress.id, outerwear: outerwear1.id + 100});
			assert.fail(0, 1, 'No error was thrown');
		} catch (err) {
			if (err.name === 'AssertionError')
				throw err;
			assert.strictEqual(err.name, 'NotFoundError');
		}
	});

	it('should not throw an error if any of the ids are null or undefined', async () => {
		await wearArticles({shirt: null, pants: undefined, dress: [null, null], outerwear: [null, undefined]});
	});

	it('should set the lastWorn property of each given article to current_date', async () => {
		await wearArticles({shirt: shirt.id, pants: pants.id, dress: dress.id, outerwear: outerwear1.id});

		const updatedShirt = await select.fromTableById('shirt', shirt.id);
		const updatedPants = await select.fromTableById('pants', pants.id);
		const updatedDress = await select.fromTableById('dress', dress.id);
		const updatedOuterwear1 = await select.fromTableById('outerwear', outerwear1.id);

		const currentDate = new Date();
		currentDate.setUTCHours(Math.floor(currentDate.getTimezoneOffset() / 60));
		currentDate.setUTCMinutes(0); currentDate.setUTCSeconds(0); currentDate.setUTCMilliseconds(0);
		assert.equalDate(updatedShirt.lastWorn, currentDate);
		assert.equalDate(updatedPants.lastWorn, currentDate);
		assert.equalDate(updatedDress.lastWorn, currentDate);
		assert.equalDate(updatedOuterwear1.lastWorn, currentDate);

	});

	it('should work when given an array of ids for a single articleKind', async () => {
		await wearArticles({outerwear: [outerwear1.id, outerwear2.id]});

		const updatedOuterwear1 = await select.fromTableById('outerwear', outerwear1.id);
		const updatedOuterwear2 = await select.fromTableById('outerwear', outerwear2.id);

		const currentDate = new Date();
		currentDate.setUTCHours(Math.floor(currentDate.getTimezoneOffset() / 60));
		currentDate.setUTCMinutes(0); currentDate.setUTCSeconds(0); currentDate.setUTCMilliseconds(0);
		assert.equalDate(updatedOuterwear1.lastWorn, currentDate);
		assert.equalDate(updatedOuterwear2.lastWorn, currentDate);
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});