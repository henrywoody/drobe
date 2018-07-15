const config = {};

// Dev
config.dev = {
	env: 'dev',
	dbName: process.env.DEV_DB_NAME,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USER,
	dbPassword: process.env.DB_PASSWORD,
	appSecret: process.env.APP_SECRET
};

// Test
config.test = {
	env: 'test',
	dbName: process.env.TEST_DB_NAME,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USER,
	dbPassword: process.env.DB_PASSWORD,
	appSecret: process.env.APP_SECRET
};



module.exports = config;