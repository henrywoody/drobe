const	chai = require('chai'),
		assert = chai.assert,
		mongoose = require('mongoose'),
		app = require('../app'),
		User = require('../models/user'),
		request = require('./helpers/request');

const endpoint = '/users';

describe('Users endpoint', () => {
	before((done) => {
		if (global.config.env !== 'test') {
			console.log(`WARNING: attempting to test in env '${global.config.env}' instead of 'test'`)
			this.skip();
		} else {
			done();
		}
	});

	describe('Register', () => {
		it('should return a 400 status with MissingUsernameError if no username is given', async () => {
			const response = await request.post(`${endpoint}/register`, {password: 'goodpassword123'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingUsernameError');
		});

		it('should return a 400 status with MissingPasswordError if no password is given', async () => {
			const response = await request.post(`${endpoint}/register`, {username: 'good_username1'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingPasswordError');
		});

		it('should return a JWT if a username and password are given', async () => {
			const response = await request.post(`${endpoint}/register`, {username: 'good_username1', password: 'goodpassword123'});

			assert.strictEqual(response.status, 200);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.token);
		})

		it('should return a 400 status with UserExistsError if a taken username is given', async () => {
			await request.post(`${endpoint}/register`, {username: 'good_username2', password: 'goodpassword123'});
			const response = await request.post(`${endpoint}/register`, {username: 'good_username2', password: 'goodpassword123'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'UserExistsError');
		});

		after(async () => {
			if (global.config.env === 'test') {
				await User.remove({});
			}
		});
	});

	describe('Login', () => {
		before(async () => {
			// make a user
			await request.post(`${endpoint}/register`, {username: 'good_username', password: 'goodpassword123'});
		});

		it('should return a 400 status with MissingCredentialsError when username and password are missing', async () => {
			const response = await request.post(`${endpoint}/login`, {});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with MissingCredentialsError when username is missing', async () => {
			const response = await request.post(`${endpoint}/login`, {});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with MissingCredentialsError when password is missing', async () => {
			const response = await request.post(`${endpoint}/login`, {});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with InvalidCredentialsError when an invalid username is given', async () => {
			const response = await request.post(`${endpoint}/login`, {username: 'bad_username', password: 'doesntmatter'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'InvalidCredentialsError');
		});

		it('should return a 400 status with InvalidCredentialsError when an invalid password for a valid username is given', async () => {
			const response = await request.post(`${endpoint}/login`, {username: 'good_username', password: 'badpassword456'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'InvalidCredentialsError');
		});

		after(async () => {
			if (global.config.env === 'test') {
				await User.remove({});
			}
		})
	});

});





