const	chai = require('chai'),
		chaiHTTP = require('chai-http'),
		app = require('../../app.js');


chai.use(chaiHTTP);

module.exports = {
	get: (endpoint, arg, { headers={} }={}) => {
		const url = arg ? endpoint + arg : endpoint;
		return chai.request(app).get(url);
	},
	post: (endpoint, payload,  { headers={} }={}) => {
		return chai.request(app).post(endpoint).send(payload);
	},
	put: (endpoint, payload,  { headers={} }={}) => {
		return chai.request(app).put(endpoint).send(payload);
	},
	delete: (endpoint, arg,  { headers={} }={}) => {
		const url = arg ? endpoint + arg : endpoint;
		return chai.request()
	}
}