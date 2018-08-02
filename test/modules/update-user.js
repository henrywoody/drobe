const	chai = require('chai'),
		assert = chai.assert,
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user'),
		updateUser = require('../../modules/update-user');

describe('Update User module', () => {
	let user, userId
	beforeEach(async () => {
		user = await createUser({username: 'test@example.com', password: 'test', locationName: 'Seattle, WA, USA', longitude: 100, latitude: 50});
		userId = user.id;
	});

	it('should return a new user with given data', async () => {
		const userData = {username: 'somethingelse@example.com', password: 'newpass', locationName: 'Los Angeles, CA, USA', latitude: 34.0, longitude: -118.0};
		updatedUser = await updateUser(userId, userData, {includePassword: true});
		
		assert.strictEqual(updatedUser.username, userData.username);
		assert.strictEqual(updatedUser.locationName, userData.locationName);
		assert.strictEqual(updatedUser.password, userData.password);
		assert.equal(updatedUser.latitude, userData.latitude);
		assert.equal(updatedUser.longitude, userData.longitude);
	});

	it('should update a new user with given data if includePassword is true', async () => {
		const userData = {username: 'somethingelse@example.com', password: 'newpass', locationName: 'Los Angeles, CA, USA', latitude: 34.0, longitude: -118.0};
		await updateUser(userId, userData, {includePassword: true});
		const { rows } = await query("SELECT * FROM app_user");
		const updatedUser = rows[0];
		
		assert.strictEqual(updatedUser.username, userData.username);
		assert.strictEqual(updatedUser.location_name, userData.locationName);
		assert.equal(updatedUser.latitude, userData.latitude);
		assert.equal(updatedUser.longitude, userData.longitude);

		assert.strictEqual(updatedUser.password, userData.password);
	});

	it('should update a user without updating the password if includePassword is false', async () => {
		const oldPassword = user.password;
		const userData = {username: 'somethingelse@example.com', password: 'newpass', locationName: 'Los Angeles, CA, USA', latitude: 34.0, longitude: -118.0};
		await updateUser(userId, userData, {includePassword: false});
		const { rows } = await query("SELECT * FROM app_user");
		const updatedUser = rows[0];

		assert.strictEqual(updatedUser.username, userData.username);
		assert.strictEqual(updatedUser.location_name, userData.locationName);
		assert.equal(updatedUser.latitude, userData.latitude);
		assert.equal(updatedUser.longitude, userData.longitude);

		assert.strictEqual(updatedUser.password, oldPassword);
	});

	it('should throw an error if a user with the same username already exists', async () => {
		await createUser({username: 'other@example.com', password: 'test'});
		try {
			await updateUser(userId, {username: 'other@example.com', password: 'test'});
			assert.fail(0, 1, 'Error not thrown'); // should not get here
		} catch (err) {
			if (err.name === 'AssertionError')
				throw err;
			assert.strictEqual(err.name, 'UserExistsError');
		}
	});

	afterEach(async () => {
		const queryText = 'DELETE FROM app_user *';
		await query(queryText, []);
	})
});