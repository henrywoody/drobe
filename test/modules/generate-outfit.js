const	chai = require('chai'),
		assert = chai.assert,
		sinon = require('sinon'),
		clearArticlesAndJoins = require('../helpers/clear-articles-and-joins'),
		generateOutfit = require('../../modules/generate-outfit'),
		createUser = require('../../modules/create-user'),
		insert = require('../../modules/insert'),
		join = require('../../modules/join'),
		getAllJoins = require('../../modules/get-all-joins'),
		query = require('../../modules/query'),
		weatherAPI = require('../../modules/weather-api');

describe('Generate Outfit module', () => {
	let user;
	let sandbox;
	let raincoat;

	before(async () => {
		user = await createUser({username: 'user', password: 'password', longitude: -122.0, latitude: 47.0});
	});

	beforeEach(async () => {
		sandbox = sinon.createSandbox();

		shirt1 = await insert.intoTableValues('shirt', {name: 'shirt1', userId: user.id});
		shirt2 = await insert.intoTableValues('shirt', {name: 'shirt2', userId: user.id});
		pants1 = await insert.intoTableValues('pants', {name: 'pants1', userId: user.id});
		pants2 = await insert.intoTableValues('pants', {name: 'pants2', userId: user.id});
		dress1 = await insert.intoTableValues('dress', {name: 'dress1', userId: user.id});
		dress2 = await insert.intoTableValues('dress', {name: 'dress2', userId: user.id});
		outerwear1 = await insert.intoTableValues('outerwear', {name: 'outerwear1', userId: user.id});
		outerwear2 = await insert.intoTableValues('outerwear', {name: 'outerwear2', userId: user.id});
		raincoat = await insert.intoTableValues('outerwear', {name: 'raincoat', userId: user.id, specificKind: 'raincoat'});


		await Promise.all([
			join.tableByIdToMany('shirt', shirt1.id, {pants: [pants1.id, pants2.id], outerwears: [outerwear1.id, outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('shirt', shirt2.id, {pants: [pants2.id], outerwears: [outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('pants', pants1.id, {outerwears: [outerwear1.id, outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('pants', pants2.id, {outerwears: [outerwear1.id, outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('dress', dress1.id, {outerwears: [outerwear1.id, outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('dress', dress2.id, {outerwears: [outerwear2.id, raincoat.id]}),
			join.tableByIdToMany('outerwear', outerwear1.id, {outerwears: [outerwear2.id, raincoat.id]})
		]);
	});

	describe('forUser method', () => {
		it('should not throw an error if the user has no articles', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 70,
				rainProb: 0.5
			});
			
			const newUser = await createUser({username: 'newUser', password: 'password'})
			await generateOutfit.forUser(newUser);
		});

		it("should call getWeather with the user's longitude and latitude", async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 70,
				rainProb: 0.5
			});

			await generateOutfit.forUser(user);

			assert.strictEqual(stub.getCall(0).args[0], user.longitude);
			assert.strictEqual(stub.getCall(0).args[1], user.latitude);
		});

		it('should return an outfit where all the keys of all the articles are camelCased', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 70,
				rainProb: 0.5
			});

			const outfit = await generateOutfit.forUser(user);

			for (const articleType in outfit) {
				if (Array.isArray(outfit[articleType])) {
					for (const article of outfit[articleType]) {
						assert.include(Object.keys(article), 'userId');
						assert.notInclude(Object.keys(article), 'user_id');
						assert.include(Object.keys(article), 'maxTemp');
						assert.notInclude(Object.keys(article), 'max_temp');
					}
				} else if (outfit[articleType]) {
					const article = outfit[articleType];
					assert.include(Object.keys(article), 'userId');
					assert.notInclude(Object.keys(article), 'user_id');
					assert.include(Object.keys(article), 'maxTemp');
					assert.notInclude(Object.keys(article), 'max_temp');
				}
			}
		});

		it('should generate an outfit where all articles are allowed for the temperature', async () => {
			const temp = 70;
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: temp,
				rainProb: 0
			});

			const outfit = await generateOutfit.forUser(user);

			for (const articleType in outfit) {
				if (Array.isArray(outfit[articleType])) {
					for (const article of outfit[articleType]) {
						assert.isTrue(article.minTemp <= temp || !article.minTemp);
						assert.isTrue(article.maxTemp >= temp || !article.maxTemp);
					}
				} else if (outfit[articleType]) {
					assert.isTrue(outfit[articleType].minTemp <= temp || !outfit[articleType].minTemp);
					assert.isTrue(outfit[articleType].maxTemp >= temp || !outfit[articleType].maxTemp);
				}
			}
		});

		it('should include an outerwear in the outfit if the temperature is below 70', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 65,
				rainProb: 0
			});

			const outfit = await generateOutfit.forUser(user);

			assert.include(Object.keys(outfit), 'outerwear');
			assert.strictEqual(outfit.outerwear.length, 1);
		});

		it('should include two outerwears in the outfit if the temperature is below 50', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 45,
				rainProb: 0
			});

			const outfit = await generateOutfit.forUser(user);

			assert.include(Object.keys(outfit), 'outerwear');
			assert.strictEqual(outfit.outerwear.length, 2);
		});

		it('should include either a shirt and pants or a dress', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 70,
				rainProb: 0
			});

			const outfit = await generateOutfit.forUser(user);

			assert.isTrue(!!outfit.shirt && !!outfit.pants && !outfit.dress || !outfit.shirt && !outfit.pants && !!outfit.dress);
		});

		it('should generate an outfit where all articles are joined with each other', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 60,
				rainProb: 0
			});

			const {
				outerwear: outfitOuterwears,
				shirt: outfitShirt,
				pants: outfitPants,
				dress: outfitDress
			} = await generateOutfit.forUser(user);
			const outfitOuterwear = outfitOuterwears[0];

			if (outfitShirt) {
				const shirtJoins = await getAllJoins.forTableById('shirt', outfitShirt.id);
				const pantsJoins = await getAllJoins.forTableById('pants', outfitPants.id);

				assert.include(shirtJoins.pants, outfitPants.id);
				assert.include(shirtJoins.outerwears, outfitOuterwear.id);
				assert.include(pantsJoins.outerwears, outfitOuterwear.id);
			} else {
				const dressJoins = await getAllJoins.forTableById('dress', outfitDress.id);

				assert.include(dressJoins.outerwears, outfitOuterwear.id);
			}
		});

		it('should generate an outfit that includes a raincoat if its raining', async () => {
			const stub = sandbox.stub(weatherAPI, 'getWeather');
			stub.returns({
				aveTemp: 60,
				rainProb: 0.9,
				rainRate: 2
			});

			const { outerwear } = await generateOutfit.forUser(user);

			assert.include(outerwear.map(e => e.id), raincoat.id);
		})
	});

	afterEach(async () => {
		await clearArticlesAndJoins();
		sandbox.restore();
	});

	after(async () => {
		await query("DELETE FROM app_user *");
	});
});