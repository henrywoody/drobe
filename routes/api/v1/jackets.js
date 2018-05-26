const	express = require('express'),
		router = express.Router(),
		Jacket = require('../../../models/jacket'),
		handleErrors = require('../../../modules/handle-db-errors');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const jackets = await Jacket.find({owner: user._id});
		res.json(jackets);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const jacket = await Jacket.findById(id);
		if (!jacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!jacket.owner.equals(user._id))
			return res.sendStatus(403);

		res.json(jacket);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { jacket: jacketData } = req.body;
		jacketData.owner = user._id;
		const newJacket = await Jacket.create(jacketData);
		res.json(newJacket);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { jacket: jacketData } = req.body;
		const jacket = await Jacket.findById(id);

		if (!jacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!jacket.owner.equals(user._id))
			return res.sendStatus(403);

		const updatedJacket = await Jacket.findByIdAndUpdate(id, jacketData, {new: true});
		res.json(updatedJacket);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const jacket = await Jacket.findById(id);

		if (!jacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!jacket.owner.equals(user._id))
			return res.sendStatus(403);

		await Jacket.findByIdAndRemove(id);
		res.send('Successfully deleted.')
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;