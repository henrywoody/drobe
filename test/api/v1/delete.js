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

describe('API DELETE methods', () => {
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

			before(async () => {
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
				const response = await request.delete(endpoint, goodArticle1._id);
				assert.strictEqual(response.status, 401);
			});

			it(`should respond with a 403 when requesting to delete a ${singularArticleName} that is not owned by the user`, async () => {
				const response = await request.delete(
					endpoint,
					badArticle._id,
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				assert.strictEqual(response.status, 403);
			});

			it(`should respond with a 404 when requesting to delete a ${singularArticleName} that does not exist`, async () => {
				const response = await request.delete(
					endpoint,
					goodArticle1._id.toString() + '1234',
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});
				assert.strictEqual(response.status, 404);
			});

			it(`should delete the requested ${singularArticleName} if it is owned by the user`, async () => {
				const response = await request.delete(
					endpoint,
					goodArticle1._id,
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(response.status, 200);

				const getResponse = await request.get(
					endpoint,
					goodArticle1._id,
					{
						headers: {
							"Authorization": `JWT ${goodUser.token}`,
							"Content-Type": 'application/json'
						}
					});

				assert.strictEqual(getResponse.status, 404);
			});

			it(`should remove references to the current ${singularArticleName} from associated articles when the current ${singularArticleName} is deleted`, async () => {
				// add some associations
				const newArticleData = {
					name: `Linked Second ${singularArticleName}`,
					description: 'now with linked articles'
				}

				switch (articleName) {
					case 'shirt':
						newArticleData.pants = [testPants._id];
						newArticleData.outerwears = [testOuterwearGood._id];
						break;
					case 'pants':
						newArticleData.shirts = [testShirt._id];
						newArticleData.outerwears = [testOuterwearGood._id];
						break;
					case 'outerwear':
						newArticleData.shirts = [testShirt._id];
						newArticleData.pants = [testPants._id];
						newArticleData.outerwears = [testOuterwearGood._id];
						break;
				}

				const headers = {
					headers: {
						"Authorization": `JWT ${goodUser.token}`,
						"Content-Type": 'application/json'
					}
				}

				const updateResponse = await request.put(
					endpoint,
					goodArticle2._id,
					{
						[articleName]: newArticleData
					},
					headers
				);

				assert.strictEqual(updateResponse.status, 200);

				// delete the article
				const deleteResponse = await request.delete(
					endpoint,
					goodArticle2._id,
					headers
				);

				assert.strictEqual(deleteResponse.status, 200);

				// check referenced articles
				const updatedTestShirtResponse = await request.get('/api/v1/shirts', testShirt._id, headers);
				const updatedTestPantsResponse = await request.get('/api/v1/pants', testPants._id, headers);
				const updatedTestOuterwearResponse = await request.get('/api/v1/outerwears', testOuterwearGood._id, headers);

				const updatedTestShirt = JSON.parse(updatedTestShirtResponse.text);
				const updatedTestPants = JSON.parse(updatedTestPantsResponse.text);
				const updatedTestOuterwear = JSON.parse(updatedTestOuterwearResponse.text);

				switch (articleName) {
					case 'shirt':
						assert.notInclude(updatedTestPants[pluralArticleName], goodArticle2._id);
						assert.notInclude(updatedTestOuterwear[pluralArticleName], goodArticle2._id);
						break;
					case 'pants':
						assert.notInclude(updatedTestShirt[pluralArticleName], goodArticle2._id);
						assert.notInclude(updatedTestOuterwear[pluralArticleName], goodArticle2._id);
						break;
					case 'outerwear':
						assert.notInclude(updatedTestShirt[pluralArticleName], goodArticle2._id);
						assert.notInclude(updatedTestPants[pluralArticleName], goodArticle2._id);
						assert.notInclude(updatedTestOuterwear[pluralArticleName], goodArticle2._id);
						break;
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