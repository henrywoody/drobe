const	chai = require('chai'),
		assert = chai.assert,
		selectUser = require('../../modules/select-user'),
		createUser = require('../../modules/create-user'),
		query = require('../../modules/query');


describe('Select User module', () => {
	let user;
	before(async () => {
		user = await createUser({username: 'user', password: 'password'});
	});

	describe('byId method', () => {
		it('should return null if no user with id is found', async () => {
			const noUser = await selectUser.byId(user.id + 1);

			assert.isNull(noUser);
		});
		
		it('should return the requested user if it exists', async () => {
			const existingUser = await selectUser.byId(user.id);

			assert.isNotNull(existingUser);
			assert.strictEqual(existingUser.username, user.username);
		});

		it('should not return the password of the requested user if includePassword is false or not specified', async () => {
			const existingUser1 = await selectUser.byId(user.id);
			assert.notInclude(Object.keys(existingUser1), 'password');

			const existingUser2 = await selectUser.byId(user.id, {includePassword: false});
			assert.notInclude(Object.keys(existingUser2), 'password');
		});

		it('should return the password of the requested user if includePassword is true', async () => {
			const existingUser = await selectUser.byId(user.id, {includePassword: true});
			assert.include(Object.keys(existingUser), 'password');
		});

		it('should camelCase the keys of the returned user', async () => {
			const existingUser = await selectUser.byId(user.id);

			assert.include(Object.keys(existingUser), 'locationName');
			assert.notInclude(Object.keys(existingUser), 'location_name');
		});
	});

	describe('byUsername method', () => {
		it('should return null if no user with username is found', async () => {
			const noUser = await selectUser.byUsername('some other name');

			assert.isNull(noUser);
		});
		
		it('should return the requested user if it exists', async () => {
			const existingUser = await selectUser.byUsername(user.username);

			assert.isNotNull(existingUser);
			assert.strictEqual(existingUser.username, user.username);
		});

		it('should not return the password of the requested user if includePassword is false or not specified', async () => {
			const existingUser1 = await selectUser.byUsername(user.username);
			assert.notInclude(Object.keys(existingUser1), 'password');

			const existingUser2 = await selectUser.byUsername(user.username, {includePassword: false});
			assert.notInclude(Object.keys(existingUser2), 'password');
		});

		it('should return the password of the requested user if includePassword is true', async () => {
			const existingUser = await selectUser.byUsername(user.username, {includePassword: true});
			assert.include(Object.keys(existingUser), 'password');
		});

		it('should camelCase the keys of the returned user', async () => {
			const existingUser = await selectUser.byUsername(user.username);

			assert.include(Object.keys(existingUser), 'locationName');
			assert.notInclude(Object.keys(existingUser), 'location_name');
		});
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});