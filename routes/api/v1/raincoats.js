const	express = require('express'),
		router = express.Router(),
		Raincoat = require('../../../models/raincoat');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const raincoats = await Raincoat.find({owner: user._id});
		res.json(raincoats);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;