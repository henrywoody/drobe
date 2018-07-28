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
		it('should return a 400 status with FormatError if no user object is given', async () => {
			const response = await request.post(`${endpoint}/register`, {}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'FormatError');
		});

		it('should return a 400 status with MissingUsernameError if no username is given', async () => {
			const response = await request.post(`${endpoint}/register`, {user: {password: 'goodpassword123'}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingUsernameError');
		});

		it('should return a 400 status with MissingPasswordError if no password is given', async () => {
			const response = await request.post(`${endpoint}/register`, {user: {username: 'good_username1'}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingPasswordError');
		});

		it('should return a JWT if a username and password are given', async () => {
			const response = await request.post(`${endpoint}/register`, {user: {username: 'good_username1', password: 'goodpassword123'}}, {type: 'json'});

			assert.strictEqual(response.status, 200);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.token);
		})

		it('should return a 400 status with UserExistsError if a taken username is given', async () => {
			await request.post(`${endpoint}/register`, {user: {username: 'good_username2', password: 'goodpassword123'}}, {type: 'json'});
			const response = await request.post(`${endpoint}/register`, {user: {username: 'good_username2', password: 'goodpassword123'}}, {type: 'json'});

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
			await request.post(`${endpoint}/register`, {user: {username: 'good_username', password: 'goodpassword123'}}, {type: 'json'});
		});

		it('should return a 400 status with FormatError when no user object is given', async () => {
			const response = await request.post(`${endpoint}/login`, {}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'FormatError');

		});

		it('should return a 400 status with MissingCredentialsError when username and password are missing', async () => {
			const response = await request.post(`${endpoint}/login`, {user: {}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with MissingCredentialsError when username is missing', async () => {
			const response = await request.post(`${endpoint}/login`, {user: {password: 'somepassword'}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with MissingCredentialsError when password is missing', async () => {
			const response = await request.post(`${endpoint}/login`, {user: {username: 'someusername'}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'MissingCredentialsError');

		});

		it('should return a 400 status with InvalidCredentialsError when an invalid username is given', async () => {
			const response = await request.post(`${endpoint}/login`, {user: {username: 'bad_username', password: 'doesntmatter'}}, {type: 'json'});

			assert.strictEqual(response.status, 400);

			const jsonResponse = JSON.parse(response.text);

			assert.exists(jsonResponse.error);
			assert.strictEqual(jsonResponse.error, 'InvalidCredentialsError');
		});

		it('should return a 400 status with InvalidCredentialsError when an invalid password for a valid username is given', async () => {
			const response = await request.post(`${endpoint}/login`, {user: {username: 'good_username', password: 'badpassword456'}}, {type: 'json'});

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





