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
	const { user } = req.user;
	try {
		const dresses = await select.fromTableByUser('dress', user.id);
		res.json(dresses);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req.user;
	const { id } = req.params;
	try {
		const dress = await select.fromTableByIdWithJoins('dress', id);

		if (dress.ownerId !== user.id)
			return res.sendStatus(403);

		res.json(dress);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { dress: dressData } = req.body;
		dressData.ownerId = user.id;
		const newDress = await insert.intoTableValues('dress', dressData);
		res.json(newDress);
	} catch (err) {
		handleErrors(err, res);
	}
});

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { dress: dressData } = req.body;
		const dress = await select.fromTableById('dress', id);

		if (dress.ownerId !== user.id)
			return res.sendStatus(403);

		dressData.ownerId = user.id;
		const updatedDress = await update.tableByIdWithValues('dress', id, dressData);
		res.json(updatedDress);
	} catch (err) {
		handleErrors(err, res);
	}
});


// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = user.params;
	try {
		const dress = await select.fromTableById('dress', id);

		if (dress.ownerId !== user.id)
			return res.sendStatus(403);

		await sqlDelete.fromTableById('dress', id);
		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;




