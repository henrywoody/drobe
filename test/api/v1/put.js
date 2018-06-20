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

describe('API PUT methods', () => {
	let goodUser, badUser;
	let testShirt, testPants, testOuterwearGood, testOuterwearBad;

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

			// set up some articles to attach
			const [testShirtResponse, testPantsResponse, testOuterwearResponse1, testOuterwearResponse2] = await Promise.all([
					request.post('/api/v1/shirts', {
							shirt: {name: 'Test Shirt'}
						},
						{
							headers: {
								"Authorization": `JWT ${goodUser.token}`,
								"Content-Type": 'application/json'
							}
					}),
					request.post('/api/v1/pants', {
							pants: {name: 'Test Pants'}
						},
						{
							headers: {
								"Authorization": `JWT ${goodUser.token}`,
								"Content-Type": 'application/json'
							}
					}),
					request.post('/api/v1/outerwears', {
							outerwear: {name: 'Good Test Outerwear'}
						},
						{
							headers: {
								"Authorization": `JWT ${goodUser.token}`,
								"Content-Type": 'application/json'
							}
					}),
					request.post('/api/v1/outerwears', {
							outerwear: {name: 'Bad Test Outerwear'}
						},
						{
							headers: {
								"Authorization": `JWT ${badUser.token}`,
								"Content-Type": 'application/json'
							}
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

			let goodArticle1, goodArticle2, badArticle;

			const	goodArticle1Name = `first good ${singularArticleName}`,
					goodArticle2Name = `second good ${singularArticleName}`,
					badArticleName = `bad ${singularArticleName}`;

			beforeEach(async () => {
				// set up articles
				const [ goodResponse1, goodResponse2, badResponse ] = await Promise.all([
						request.post(endpoint, {[articleName]: {name: goodArticle1Name}}, {headers: {"Authorization": `JWT ${goodUser.token}`, "Content-Type": 'application/json'}}),
						request.post(endpoint, {[articleName]: {name: goodArticle2Name}}, {headers: {"Authorization": `JWT ${goodUser.token}`, "Content-Type": 'application/json'}}),
						request.post(endpoint, {[articleName]: {name: badArticleName}}, {headers: {"Authorization": `JWT ${badUser.token}`, "Content-Type": 'application/json'}})
					]);

				goodArticle1 = JSON.parse(goodResponse1.text);
				goodArticle2 = JSON.parse(goodResponse2.text);
				badArticle = JSON.parse(badResponse.text);
			});

			it('should respond with a 401 status when an authorization header is not supplied', async () => {
				const response = await request.put(endpoint, goodArticle1._id, {[articleName]: {new: 'data'}});
				assert.strictEqual(response.status, 401);
			});

			it(`should respond with a 403 when requesting to modify a ${singularArticleName} that is not owned by the user`, async () => {
				const response = await request.put(
					endpoint,
					badArticle._id,
					{
						[articleName]: {new: 'data'}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				assert.strictEqual(response.status, 403);
			});

			it(`should respond with a 404 when requesting a ${singularArticleName} that does not exist`, async () => {
				const response = await request.put(
					endpoint,
					goodArticle1._id.toString() + '1234',
					{
						[articleName]: {new: 'data'}
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				assert.strictEqual(response.status, 404);
			});

			it(`should update the requested ${singularArticleName} with the given data and return the updated ${singularArticleName} if the user owns the ${singularArticleName}`, async () => {
				const newArticleData = {
					name: `Updated First ${singularArticleName}`,
					description: 'new and improved'
				}

				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: newArticleData
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 200);

				const jsonResponse = JSON.parse(response.text);

				for (const attribute in newArticleData) {
					assert.exists(jsonResponse[attribute]),
					assert.strictEqual(jsonResponse[attribute], newArticleData[attribute]);
				}
			});

			it(`should respond with a 400 error: DuplicateError and not modify the ${singularArticleName} when given a new name that is the same as that of another ${singularArticleName} for the same user`, async () => {
				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: {
							name: `second good ${singularArticleName}`,
							description: 'this shouldnt be here'
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


				const checkResponse = await request.get(
					endpoint,
					goodArticle1._id,
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(checkResponse.status, 200);

				const checkJsonResponse = JSON.parse(checkResponse.text);

				assert.exists(checkJsonResponse.name);
				assert.strictEqual(checkJsonResponse.name, goodArticle1Name);
				assert.notExists(checkJsonResponse.description);
			});

			it(`should allow a ${singularArticleName} to be updated with a name that matches another ${singularArticleName} owned by another user`, async () => {
				const newArticleData = {
					name: `bad ${singularArticleName}`,
					description: 'i dont like it anymore'
				}

				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: newArticleData
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 200);

				const jsonResponse = JSON.parse(response.text);

				for (const attribute in newArticleData) {
					assert.exists(jsonResponse[attribute]),
					assert.strictEqual(jsonResponse[attribute], newArticleData[attribute]);
				}
			});















			it('should respond with a 400 error: InvalidIdForModel when associated article ids are invalid for the specified article kind', async () => {
				const newArticleData = {
					name: `Linked First ${singularArticleName}`,
					description: 'now with linked articles',
					outerwears: [testPants._id]
				}

				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: newArticleData
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
				assert.strictEqual(jsonResponse.error, 'InvalidIdForModel');
			});

			it('should respond with a 403 error: InvalidIdForOwner when associated article ids are invalid for the specified article kind', async () => {
				const newArticleData = {
					name: `Linked First ${singularArticleName}`,
					description: 'now with linked articles',
					outerwears: [testOuterwearBad._id]
				}

				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: newArticleData
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 403);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.error);
				assert.strictEqual(jsonResponse.error, 'InvalidIdForOwner');
			});

			it(`should update the requested ${singularArticleName} with the given data and return the updated ${singularArticleName} if given valid linked article ids`, async () => {
				const newArticleData = {
					name: `Linked First ${singularArticleName}`,
					description: 'now with linked articles',
					shirts: [testShirt._id],
					pants: [testPants._id],
					outerwears: [testOuterwearGood._id]
				}

				const response = await request.put(
					endpoint,
					goodArticle1._id,
					{
						[articleName]: newArticleData
					},
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 200);

				const jsonResponse = JSON.parse(response.text);

				assert.exists(jsonResponse.owner);
				assert.strictEqual(jsonResponse.owner, goodUser._id);
			});



















			afterEach(async () => {
				if (global.config.env === 'test') {
					await Promise.all([
						Model.findByIdAndRemove(goodArticle1._id),
						Model.findByIdAndRemove(goodArticle2._id),
						Model.findByIdAndRemove(badArticle._id)
					]);
				}
			});
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