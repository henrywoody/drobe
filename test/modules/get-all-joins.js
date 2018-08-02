const	chai = require('chai'),
		assert = chai.assert,
		getAllJoins = require('../../modules/get-all-joins'),
		createUser = require('../../modules/create-user'),
		insert = require('../../modules/insert'),
		query = require('../../modules/query'),
		join = require('../../modules/join');

describe('Get All Joins module', () => {
	let user;
	let shirt, pants, dress, jacket, sweater;

	before(async () => {
		user = await createUser({username: 'user', password: 'pass'});
	});

	beforeEach(async () => {
		shirt = await insert.intoTableValues('shirt', {name: 'good shirt', userId: user.id});
		pants1 = await insert.intoTableValues('pants', {name: 'good pants', userId: user.id});
		pants2 = await insert.intoTableValues('pants', {name: 'better pants', userId: user.id});
		pants3 = await insert.intoTableValues('pants', {name: 'best pants', userId: user.id});
		dress = await insert.intoTableValues('dress', {name: 'good dress', userId: user.id});
		jacket = await insert.intoTableValues('outerwear', {name: 'good jacket', userId: user.id});
		sweater = await insert.intoTableValues('outerwear', {name: 'good sweater', userId: user.id});

		await Promise.all([
			join.tableByIdToTableById('shirt', shirt.id, 'pants', pants1.id),
			join.tableByIdToTableById('shirt', shirt.id, 'pants', pants2.id),
			join.tableByIdToTableById('shirt', shirt.id, 'pants', pants3.id),
			join.tableByIdToTableById('shirt', shirt.id, 'outerwear', jacket.id),
			join.tableByIdToTableById('pants', pants1.id, 'outerwear', sweater.id),
			join.tableByIdToTableById('dress', dress.id, 'outerwear', jacket.id),
			join.tableByIdToTableById('outerwear', jacket.id, 'outerwear', sweater.id)
		]);
	});

	describe('forTableById method', () => {
		it('should throw a ValidationError if the given table is not for an article', async () => {
			try {
				await getAllJoins.forTableById('app_user', user.id);
				assert.fail(0, 1, 'No error was thrown');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'ValidationError');
			}
		});

		it('should return an object with the correct keys and empty arrays as values if the object has no joins', async () => {
			otherShirt = await insert.intoTableValues('shirt', {name: 'another shirt', userId: user.id});
			const allJoins = await getAllJoins.forTableById('shirt', otherShirt.id);

			assert.include(Object.keys(allJoins), 'pants');
			assert.include(Object.keys(allJoins), 'outerwears');
			assert.isEmpty(allJoins.pants);
			assert.isEmpty(allJoins.outerwears);
		});

		it('should return an object with the correct keys and the ids of all joined objects in arrays as values', async () => {
			const shirtJoins = await getAllJoins.forTableById('shirt', shirt.id);
			assert.include(shirtJoins.pants, pants1.id);
			assert.include(shirtJoins.pants, pants2.id);
			assert.include(shirtJoins.pants, pants3.id);
			assert.include(shirtJoins.outerwears, jacket.id);

			const pantsJoins = await getAllJoins.forTableById('pants', pants1.id);
			assert.include(pantsJoins.shirts, shirt.id);
			assert.include(pantsJoins.outerwears, sweater.id);

			const dressJoins = await getAllJoins.forTableById('dress', dress.id);
			assert.include(dressJoins.outerwears, jacket.id);

			const jacketJoins = await getAllJoins.forTableById('outerwear', jacket.id);
			assert.include(jacketJoins.shirts, shirt.id);
			assert.isEmpty(jacketJoins.pants);
			assert.include(jacketJoins.dresses, dress.id);
			assert.include(jacketJoins.outerwears, sweater.id);

			const sweaterJoins = await getAllJoins.forTableById('outerwear', sweater.id);
			assert.include(sweaterJoins.pants, pants1.id);
		});
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

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});