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

describe('API DELETE methods', () => {
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

			it('should delete the requested shirt if it is owned by the user', async () => {
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