const	chai = require('chai'),
		assert = chai.assert,
		query = require('../../modules/query'),
		createUser = require('../../modules/create-user');

describe('Create User module', () => {
	it('should throw a UserExistsError if a user with the same email already exists', async () => {
		await createUser({email: 'test@example.com', password: 'test'});
		try {
			await createUser({email: 'test@example.com', password: 'test'});
			assert.fail(0, 1, 'Error not thrown'); // should not get here
		} catch (err) {
			if (err.name === 'AssertionError')
				throw err;
			assert.strictEqual(err.name, 'UserExistsError');
		}
	});
	
	it('should return a new user with given data', async () => {
		const userData = {email: 'test@example.com', password: 'test', locationName: 'Seattle, WA, USA', latitude: 36.0, longitude: -122.0};
		newUser = await createUser(userData);
		
		assert.strictEqual(newUser.email, userData.email);
		assert.strictEqual(newUser.locationName, userData.locationName);
		assert.strictEqual(newUser.password, userData.password);
		assert.equal(newUser.latitude, userData.latitude);
		assert.equal(newUser.longitude, userData.longitude);
	});

	it('should create a new user in the database with given data', async () => {
		const userData = {email: 'test@example.com', password: 'test', locationName: 'Seattle, WA, USA', latitude: 36.0, longitude: -122.0};
		await createUser(userData);
		const { rows } = await query("SELECT * FROM app_user");
		const newUser = rows[0];
		
		assert.strictEqual(newUser.email, userData.email);
		assert.strictEqual(newUser.location_name, userData.locationName);
		assert.strictEqual(newUser.password, userData.password);
		assert.equal(newUser.latitude, userData.latitude);
		assert.equal(newUser.longitude, userData.longitude);
	});

	afterEach(async () => {
		const queryText = 'DELETE FROM app_user *';
		await query(queryText, []);
	})
});