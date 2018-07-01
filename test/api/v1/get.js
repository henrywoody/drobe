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

describe('API GET methods', () => {
	let goodUser, badUser;

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
						request.post(endpoint, {[articleName]: {name: goodArticle1Name}}, {headers: {"Authorization": `JWT ${goodUser.token}`}}),
						request.post(endpoint, {[articleName]: {name: goodArticle2Name}}, {headers: {"Authorization": `JWT ${goodUser.token}`}}),
						request.post(endpoint, {[articleName]: {name: badArticleName}}, {headers: {"Authorization": `JWT ${badUser.token}`}})
					]);

				goodArticle1 = JSON.parse(goodResponse1.text);
				goodArticle2 = JSON.parse(goodResponse2.text);
				badArticle = JSON.parse(badResponse.text);
			});

			describe('the index route', () => {
				it('should respond with a 401 status when an authorization header is not supplied', async () => {
					const response = await request.get(endpoint);
					assert.strictEqual(response.status, 401);
				});

				it(`should respond with all and only with ${pluralArticleName} owned by the user`, async () => {
					const response = await request.get(endpoint, null, {headers: {"Authorization": `JWT ${goodUser.token}`}});
					
					assert.strictEqual(response.status, 200);

					const jsonResponse = JSON.parse(response.text);

					assert.instanceOf(jsonResponse, Array);
					assert.lengthOf(jsonResponse, 2); // all articles owned by user

					for (let i = 0; i < jsonResponse.length; i++) {
						const article = jsonResponse[i];
						assert.typeOf(article, 'object');
						assert.strictEqual(article.owner, goodUser._id); // only articles owned by user
					}
				});
			});

			describe('the detail route', () => {
				it('should respond with a 401 status when an authorization header is not supplied', async () => {
					const response = await request.get(endpoint, goodArticle1._id);
					assert.strictEqual(response.status, 401);
				});

				it(`should respond with a 403 status when requesting a ${articleName} that is not owned by the user`, async () => {
					const response = await request.get(
						endpoint,
						badArticle._id,
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
						});

					assert.strictEqual(response.status, 403);
				});

				it(`should respond with a 404 status when requesting a ${singularArticleName} that does not exist`, async () => {
					const response = await request.get(
						endpoint,
						goodArticle1._id.toString() + '1234',
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
						});

					assert.strictEqual(response.status, 404);
				});

				it(`should respond with the requested ${singularArticleName} if it is owned by the owner`, async () => {
					const response = await request.get(
						endpoint,
						goodArticle1._id,
						{
							headers: {"Authorization": `JWT ${goodUser.token}`}
						});

					assert.strictEqual(response.status, 200);

					const jsonResponse = JSON.parse(response.text);

					assert.typeOf(jsonResponse, 'object');
					assert.strictEqual(jsonResponse.name, goodArticle1Name);
				});
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