const	chai = require('chai'),
		assert = chai.assert,
		selectUser = require('../../modules/select-user'),
		createUser = require('../../modules/create-user'),
		query = require('../../modules/query');


describe('Select User module', () => {
	let user;
	before(async () => {
		user = await createUser({email: 'user@example.com', password: 'password'});
	});

	describe('byId method', () => {
		it('should throw a UserNotFoundError if no user with id is found', async () => {
			try {
				await selectUser.byId(user.id + 1);
				assert.fail(0, 1, 'No error was raised');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'UserNotFoundError');
			}
		});
		
		it('should return the requested user if it exists', async () => {
			const existingUser = await selectUser.byId(user.id);

			assert.isNotNull(existingUser);
			assert.strictEqual(existingUser.email, user.email);
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

	describe('byEmail method', () => {
		it('should throw a UserNotFoundError if no user with email is found', async () => {
			try {
				await selectUser.byEmail('someothername@example.com');
				assert.fail(0, 1, 'No error was raised');
			} catch (err) {
				if (err.name === 'AssertionError')
					throw err;
				assert.strictEqual(err.name, 'UserNotFoundError');
			}
		});
		
		it('should return the requested user if it exists', async () => {
			const existingUser = await selectUser.byEmail(user.email);

			assert.isNotNull(existingUser);
			assert.strictEqual(existingUser.email, user.email);
		});

		it('should not return the password of the requested user if includePassword is false or not specified', async () => {
			const existingUser1 = await selectUser.byEmail(user.email);
			assert.notInclude(Object.keys(existingUser1), 'password');

			const existingUser2 = await selectUser.byEmail(user.email, {includePassword: false});
			assert.notInclude(Object.keys(existingUser2), 'password');
		});

		it('should return the password of the requested user if includePassword is true', async () => {
			const existingUser = await selectUser.byEmail(user.email, {includePassword: true});
			assert.include(Object.keys(existingUser), 'password');
		});

		it('should camelCase the keys of the returned user', async () => {
			const existingUser = await selectUser.byEmail(user.email);

			assert.include(Object.keys(existingUser), 'locationName');
			assert.notInclude(Object.keys(existingUser), 'location_name');
		});
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});