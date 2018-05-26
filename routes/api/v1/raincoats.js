const	express = require('express'),
		router = express.Router(),
		Raincoat = require('../../../models/raincoat'),
		handleErrors = require('../../../modules/handle-db-errors');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const raincoats = await Raincoat.find({owner: user._id});
		res.json(raincoats);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const raincoat = await Raincoat.findById(id);
		if (!raincoat) {
			const err = new Error('Raincoat Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!raincoat.owner.equals(user._id))
			return res.sendStatus(403);

		res.json(raincoat);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { raincoat: raincoatData } = req.body;
		raincoatData.owner = user._id;
		const newRaincoat = await Raincoat.create(raincoatData);
		res.json(newRaincoat);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const { raincoat: raincoatData } = req.body;
		const raincoat = await Raincoat.findById(id);

		if (!raincoat) {
			const err = new Error('Raincoat Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!raincoat.owner.equals(user._id))
			return res.sendStatus(403);

		const updatedRaincoat = await Raincoat.findByIdAndUpdate(id, raincoatData, {new: true});
		res.json(updatedRaincoat);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const raincoat = await Raincoat.findById(id);

		if (!raincoat) {
			const err = new Error('Raincoat Not Found');
			err.name = 'NotFound';
			throw err;
		}
		if (!raincoat.owner.equals(user._id))
			return res.sendStatus(403);

		await Raincoat.findByIdAndRemove(id);
		res.send('Successfully deleted.')
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;