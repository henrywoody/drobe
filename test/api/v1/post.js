const	chai = require('chai'),
		assert = chai.assert,
		mongoose = require('mongoose'),
		app = require('../../../app'),
		User = require('../../../models/user'),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Jacket = require('../../../models/jacket'),
		Raincoat = require('../../../models/raincoat'),
		request = require('../../helpers/request');

const models = {
	shirt: Shirt,
	pants: Pants,
	jacket: Jacket,
	raincoat: Raincoat
};

describe('API POST methods', () => {
	let goodUser, badUser;

	before(async () => {
		if (global.config.env !== 'test') {
			console.log(`WARNING: attempting to test in env '${global.config.env}' instead of 'test'`)
			this.skip();
		} else {
			// set up users
			const [ goodResponse, badResponse ] = await Promise.all([
					request.post(`/users/register`, {username: 'good_username', password: 'goodpassword123'}),
					request.post(`/users/register`, {username: 'bad_username', password: 'badpassword123'})
				]);

			goodData = JSON.parse(goodResponse.text);
			badData = JSON.parse(badResponse.text);
			goodUser = {...goodData.user, token: goodData.token};
			badUser = {...badData.user, token: badData.token};
		}
	})

	for (const articleName in models) {
		const pluralArticleName = `${articleName}${articleName === 'pants' ? '' : 's'}`;
		const singularArticleName = articleName === 'pants' ? 'pair of pants' : articleName;
		const Model = models[articleName];

		describe(pluralArticleName, () => {
			const endpoint = `/api/v1/${pluralArticleName}`;

			it('should respond with a 401 status when an authorization header is not supplied', async () => {
				const response = await request.post(endpoint, {[articleName]: {some: 'data'} });
				assert.strictEqual(response.status, 401);
			});

			it('should respond with a 400 error: ValidationError when given data lacking a name', async () => {
				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							some: 'data'
						}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				
				assert.strictEqual(response.status, 400);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'ValidationError');
			});

			it(`should respond with a 400 error: ValidationError when given ${singularArticleName} rating exceeds 5`, async () => {
				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							name: "Just Too Good",
							rating: 6
						}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				
				assert.strictEqual(response.status, 400);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'ValidationError');
			});

			it(`should return the newly created ${singularArticleName} in JSON format when given valid data`, async () => {
				const inputData = {
					name: `Good ${singularArticleName}`,
					description: 'the one that is really nice',
					color: 'blue',
					maxTemp: 100,
					minTemp: 30,
					rating: 5,
					image: 'path/to/an/image'
				};

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 200);


				const jsonResponse = JSON.parse(response.text);

				for (const attribute in inputData) {
					assert.exists(jsonResponse[attribute]);
					assert.strictEqual(jsonResponse[attribute], inputData[attribute]);
				}

				assert.exists(jsonResponse.owner);
				assert.strictEqual(jsonResponse.owner, goodUser._id);
			});

			it(`should respond with a 400 error: DuplicateError when given a ${singularArticleName} with a duplicate name for an owner`, async () => {
				await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				
				assert.strictEqual(response.status, 400);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'DuplicateError');
			});

			it(`should allow ${pluralArticleName} with duplicate names from different owners`, async () => {
				await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {
							"Authorization": `JWT ${badUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				
				assert.strictEqual(response.status, 200);
			});

			after(async () => {
				if (global.config.env === 'test')
					await Model.remove({});
			});
		});
	}

	after( async () => {
		if (global.config.env === 'test')
			await User.remove({});
	})
});