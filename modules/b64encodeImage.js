module.exports = (data, imgType) => {
	return `data:${imgType};base64, ${data.toString('base64')}`
}