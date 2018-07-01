const	chai = require('chai'),
		chaiHTTP = require('chai-http'),
		app = require('../../app.js');


chai.use(chaiHTTP);

module.exports = {
	get: (endpoint, arg, { headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		return chai.request(app).get(url).set(headers);
	},
	post: (endpoint, payload, { type='form', headers={} }={}) => {
		if (type === 'form') {
			articleKind = Object.keys(payload)[0];
			return chai.request(app).post(endpoint).set(headers).type(type).field(articleKind, JSON.stringify(payload[articleKind]));
		}
		return chai.request(app).post(endpoint).set(headers).type(type).send(payload);
	},
	put: (endpoint, arg, payload, { type='form', headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		if (type === 'form') {
			articleKind = Object.keys(payload)[0];
			return chai.request(app).put(url).set(headers).type(type).field(articleKind, JSON.stringify(payload[articleKind]));
		}
		return chai.request(app).put(url).set(headers).type(type).send(payload);
	},
	delete: (endpoint, arg, { headers={} }={}) => {
		const url = arg ? `${endpoint}/${arg}` : endpoint;
		return chai.request(app).delete(url).set(headers);
	}
}