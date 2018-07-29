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
		const pants = await select.fromTableByUser('pants', user.id);
		res.json(pants);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const pair = await select.fromTableById('pants', id);
		
		if (pair.ownerId !== user.id)
			return res.sendStatus(403);

		res.json(pair);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { pants: pairData } = req.body;
		pairData.ownerId = user.id;
		const newPair = await insert.intoTableValues('pants', pairData);
		res.json(newPair);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { pants: pairData } = req.body;
		const pair = await select.fromTableById('pants', id);

		if (pair.ownerId !== user.id)
			return res.sendStatus(403);

		pairData.ownerId = user.id;
		const updatedPair = await update.tableByIdWithValues('pants', id, pairData);
		res.json(updatedPair);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const pair = await select.fromTableById('pants', id);

		if (pair.ownerId !== user.id)
			return res.sendStatus(403);

		await sqlDelete.fromTableById('pants', id);
		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;