const	express = require('express'),
		router = express.Router(),
		verifyIds = require('../../../modules/verify-ids'),
		handleErrors = require('../../../modules/handle-db-errors'),
		select = require('../../../modules/select'),
		insert = require('../../../modules/insert'),
		update = require('../../../modules/update'),
		sqlDelete = require('../../../modules/delete');


function throwNotFoundError() {
	const err = new Error('Outerwear Not Found.');
	err.name = 'NotFound';
	throw err;
}

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const outerwears = await select.fromTableByUser('outerwear', user.id);
		res.json(outerwears);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const outerwear = await select.fromTableById('outerwear', id);
		
		if (!outerwear)
			throwNotFoundError();
		if (outerwear.ownerId !== user.id)
			return res.sendStatus(403);

		res.json(outerwear);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { outerwear: outerwearData } = req.body;
		outerwearData.ownerId = user.id;
		const newOuterwear = await insert.intoTableValues('outerwear', outerwearData);
		res.json(newOuterwear);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { outerwear: outerwearData } = req.body;
		const outerwear = await select.fromTableById('outerwear', id);

		if (!outerwear)
			throwNotFoundError();
		if (outerwear.ownerId !== user.id)
			return res.sendStatus(403);

		outerwearData.ownerId = user.id;
		const updatedOuterwear = await update.tableByIdWithValues('outerwear', id, outerwearData);
		res.json(updatedOuterwear);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const outerwear = await select.fromTableById('outerwear', id);

		if (!outerwear)
			throwNotFoundError();
		if (outerwear.ownerId !== user.id)
			return res.sendStatus(403);

		await sqlDelete.fromTableById('outerwear', id);
		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;