const	chai = require('chai'),
		assert = chai.assert,
		mongoose = require('mongoose'),
		app = require('../../../app'),
		User = require('../../../models/user'),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Outerwear = require('../../../models/outerwear'),
		request = require('../../helpers/request');

const models = {
	shirt: Shirt,
	pants: Pants,
	outerwear: Outerwear
};

describe('API POST methods', () => {
	let goodUser, badUser;
	let testShirt, testPants, testOuterwearGood, testOuterwearBad;

	before(async () => {
		if (global.config.env !== 'test') {
			console.log(`WARNING: attempting to test in env '${global.config.env}' instead of 'test'`)
			this.skip();
		} else {
			// set up users
			const [ goodResponse, badResponse ] = await Promise.all([
					request.post(`/users/register`, {user: {username: 'good_username', password: 'goodpassword123'}}, {type: 'json'}),
					request.post(`/users/register`, {user: {username: 'bad_username', password: 'badpassword123'}}, {type: 'json'})
				]);

			goodData = JSON.parse(goodResponse.text);
			badData = JSON.parse(badResponse.text);
			goodUser = {...goodData.user, token: goodData.token};
			badUser = {...badData.user, token: badData.token};

			// set up some articles to attach
			const [testShirtResponse, testPantsResponse, testOuterwearResponse1, testOuterwearResponse2] = await Promise.all([
					request.post('/api/v1/shirts', {
							shirt: {name: 'Test Shirt'}
						},
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
					}),
					request.post('/api/v1/pants', {
							pants: {name: 'Test Pants'}
						},
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
					}),
					request.post('/api/v1/outerwears', {
							outerwear: {name: 'Good Test Outerwear'}
						},
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
					}),
					request.post('/api/v1/outerwears', {
							outerwear: {name: 'Bad Test Outerwear'}
						},
						{
							headers: {"Authorization": `JWT ${badUser.token}`}
					})
				]);
			testShirt = JSON.parse(testShirtResponse.text);
			testPants = JSON.parse(testPantsResponse.text);
			testOuterwearGood = JSON.parse(testOuterwearResponse1.text);
			testOuterwearBad = JSON.parse(testOuterwearResponse2.text);
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
						headers: {"Authorization": `JWT ${goodUser.token}`}
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
						headers: {"Authorization": `JWT ${goodUser.token}`}
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
					rating: 5
				};

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					{
						headers: {"Authorization": `JWT ${goodUser.token}`}
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
						headers: {"Authorization": `JWT ${goodUser.token}`}
					});

				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {"Authorization": `JWT ${goodUser.token}`}
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
						headers: {"Authorization": `JWT ${goodUser.token}`}
					});

				const response = await request.post(
					endpoint,
					{
						[articleName]: {
							name: `My Only ${singularArticleName}`,
						}
					},
					{
						headers: {"Authorization": `JWT ${badUser.token}`}
					});
				
				assert.strictEqual(response.status, 200);
			});

			it('should respond with a 400 error: InvalidIdForModel when associated article ids are invalid for the specified article kind', async () => {
				const inputData = {
					name: 'This isnt going to work',
					outerwears: [testPants._id]
				};

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					{
						headers: {"Authorization": `JWT ${goodUser.token}`}
					});

				assert.strictEqual(response.status, 400);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'InvalidIdForModel');
			});

			it('should respond with a 403 error: InvalidIdForOwner when associated article ids are invalid for the specified article kind', async () => {
				const inputData = {
					name: 'This isnt going to work',
					outerwears: [testOuterwearBad._id]
				};

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					{
						headers: {"Authorization": `JWT ${goodUser.token}`}
					});

				assert.strictEqual(response.status, 403);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'InvalidIdForOwner');
			});

			it(`should return the newly created ${singularArticleName} in JSON format when given valid associated article ids`, async () => {
				const inputData = {
					name: `Linked ${singularArticleName}`
				};

				switch (articleName) {
					case 'shirt':
						inputData.pants = [testPants._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
					case 'pants':
						inputData.shirts = [testShirt._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
					case 'outerwear':
						inputData.shirts = [testShirt._id];
						inputData.pants = [testPants._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
				}

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					{
						headers: {"Authorization": `JWT ${goodUser.token}`}
					});

				assert.strictEqual(response.status, 200);

				const jsonResponse = JSON.parse(response.text);

				for (const attribute in inputData) {
					assert.exists(jsonResponse[attribute]);
					if (Array.isArray(jsonResponse[attribute])) {
						assert.deepEqual(jsonResponse[attribute], inputData[attribute])
					} else {
						assert.strictEqual(jsonResponse[attribute], inputData[attribute]);
					}
				}

				assert.exists(jsonResponse.owner);
				assert.strictEqual(jsonResponse.owner, goodUser._id);
			});

			it(`should update associated articles with references to the new article`, async () => {
				const inputData = {
					name: `Second Linked ${singularArticleName}`
				};

				switch (articleName) {
					case 'shirt':
						inputData.pants = [testPants._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
					case 'pants':
						inputData.shirts = [testShirt._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
					case 'outerwear':
						inputData.shirts = [testShirt._id];
						inputData.pants = [testPants._id];
						inputData.outerwears = [testOuterwearGood._id];
						break;
				}

				const headers = {
					headers: {
						"Authorization": `JWT ${goodUser.token}`
					}
				}

				const response = await request.post(
					endpoint,
					{
						[articleName]: inputData
					},
					headers
					);

				assert.strictEqual(response.status, 200);


				const jsonResponse = JSON.parse(response.text);

				const updatedTestShirtResponse = await request.get('/api/v1/shirts', testShirt._id, headers);
				const updatedTestPantsResponse = await request.get('/api/v1/pants', testPants._id, headers);
				const updatedTestOuterwearResponse = await request.get('/api/v1/outerwears', testOuterwearGood._id, headers);

				const updatedTestShirt = JSON.parse(updatedTestShirtResponse.text);
				const updatedTestPants = JSON.parse(updatedTestPantsResponse.text);
				const updatedTestOuterwear = JSON.parse(updatedTestOuterwearResponse.text);

				switch (articleName) {
					case 'shirt':
						assert.include(updatedTestPants[pluralArticleName], jsonResponse._id);
						assert.include(updatedTestOuterwear[pluralArticleName], jsonResponse._id);
						break;
					case 'pants':
						assert.include(updatedTestShirt[pluralArticleName], jsonResponse._id);
						assert.include(updatedTestOuterwear[pluralArticleName], jsonResponse._id);
						break;
					case 'outerwear':
						assert.include(updatedTestShirt[pluralArticleName], jsonResponse._id);
						assert.include(updatedTestPants[pluralArticleName], jsonResponse._id);
						assert.include(updatedTestOuterwear[pluralArticleName], jsonResponse._id);
						break;
				}

			});

			if (articleName === 'outerwear') {
				it('should respond with a 400 error: ValidationError when given an invalid specific type', async () => {
					const inputData = {
						name: 'Invalid Coat',
						specificType: 'SomethingElse'
					};

					const response = await request.post(
						endpoint,
						{
							[articleName]: inputData
						},
						{
							headers: {"Authorization": `JWT ${badUser.token}`}
						});

					assert.strictEqual(response.status, 400);

					jsonResponse = JSON.parse(response.text);

					assert.exists(jsonResponse.error);
					assert.strictEqual(jsonResponse.error, 'ValidationError')
				});

				it ('should return the newly created outerwear in JSON format when given a valid specificType', async () => {
					const inputData = {
						name: 'Valid Jacket',
						specificType: 'jacket'
					};

					const response = await request.post(
						endpoint,
						{
							[articleName]: inputData
						},
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
						});

					assert.strictEqual(response.status, 200);

					const jsonResponse = JSON.parse(response.text);

					for (const attribute in inputData) {
						assert.exists(jsonResponse[attribute]);
						assert.strictEqual(jsonResponse[attribute], inputData[attribute]);
					}

					assert.exists(jsonResponse.owner);
					assert.strictEqual(jsonResponse.owner, goodUser._id);
				})
			}
		});
	}

	after( async () => {
		if (global.config.env === 'test')
			await Promise.all([
				User.remove({}),
				Shirt.remove({}),
				Pants.remove({}),
				Outerwear.remove({})
			]);
	})
});