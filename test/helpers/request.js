const	chai = require('chai'),
		chaiHTTP = require('chai-http'),
		app = require('../../app.js');


chai.use(chaiHTTP);

module.exports = {
	get: (endpoint, arg, { headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		return chai.request(app).get(url).set(headers);
	},
	post: (endpoint, payload, { headers={} }={}) => {
		return chai.request(app).post(endpoint).set(headers).send(payload);
	},
	put: (endpoint, arg, payload, { headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		return chai.request(app).put(url).set(headers).send(payload);
	},
	delete: (endpoint, arg, { headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		return chai.request(app).delete(url).set(headers);
	}
}