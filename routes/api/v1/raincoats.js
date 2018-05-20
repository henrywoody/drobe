const	express = require('express'),
		router = express.Router(),
		Raincoat = require('../../../models/raincoat');

// Index
router.get('/', async (req, res) => {
	try {
		const raincoats = await Raincoat.find({});
		res.json(raincoats);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const raincoat = await Raincoat.findById(id);
		if (!raincoat) {
			const err = new Error('Raincoat Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(raincoat);
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

// Create
router.post('/', async (req, res) => {
	try {
		const { raincoat } = req.body;
		const raincoatData = JSON.parse(raincoat);
		const newRaincoat = await Raincoat.create(raincoatData);
		res.json(newRaincoat);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const { raincoat } = req.body;
		const raincoatData = JSON.parse(raincoat);
		const updatedRaincoat = await Raincoat.findByIdAndUpdate(id, raincoatData, {new: true});
		if (!updatedRaincoat) {
			const err = new Error('Raincoat Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(updatedRaincoat);
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const deletedRaincoat = await Raincoat.findByIdAndRemove(id);
		if (!deletedRaincoat) {
			const err = new Error('Raincoat Not Found');
			err.name = 'NotFound';
			throw err;
		}
		res.send('Successfully deleted.')
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find raincoat with id: ${id}`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;