const config = {};

// Dev
config.dev = {
	dbHost: process.env.DB_HOST_DEV,
	appSecret: process.env.APP_SECRET
};

// Test
config.test = {
	dbHost: process.env.DB_HOST_TEST,
	appSecret: process.env.APP_SECRET
};



module.exports = config;