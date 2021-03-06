const	express = require('express'),
		router = express.Router(),
		verifyIds = require('../../../modules/verify-ids'),
		handleErrors = require('../../../modules/handle-db-errors'),
		select = require('../../../modules/select'),
		insert = require('../../../modules/insert'),
		update = require('../../../modules/update'),
		sqlDelete = require('../../../modules/delete');


// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const shirts = await select.fromTableByUser('shirt', user.id);
		res.json(shirts)
	} catch (err) {
		handleErrors(err, res);
	}
});

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const shirt = await select.fromTableByIdWithJoins('shirt', id);

		if (shirt.userId !== user.id)
			return res.sendStatus(403);

		res.json(shirt);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { shirt: shirtData } = req.body;
		shirtData.userId = user.id;
		const newShirt = await insert.intoTableValues('shirt', shirtData);
		res.json(newShirt);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { shirt: shirtData } = req.body;
		const shirt = await select.fromTableById('shirt', id);

		if (shirt.userId !== user.id)
			return res.sendStatus(403);

		shirtData.userId = user.id;
		const updatedShirt = await update.tableByIdWithValues('shirt', id, shirtData);
		res.json(updatedShirt);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const shirt = await select.fromTableById('shirt', id);

		if (shirt.userId !== user.id)
			return res.sendStatus(403);

		await sqlDelete.fromTableById('shirt', id);
		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;