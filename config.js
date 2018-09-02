const config = {};

// Dev
config.dev = {
	env: 'dev',
	backendPort: process.env.BACKEND_PORT,
	dbName: process.env.DEV_DB_NAME,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USER,
	dbPassword: process.env.DB_PASSWORD,
	appSecret: process.env.APP_SECRET,
	weatherApiKey: process.env.WEATHER_API_KEY,
	googleApiKey: process.env.GOOGLE_API_KEY,
	imagesBucket: process.env.DEV_IMAGES_BUCKET,
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// Test
config.test = {
	env: 'test',
	backendPort: process.env.BACKEND_PORT,
	dbName: process.env.TEST_DB_NAME,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USER,
	dbPassword: process.env.DB_PASSWORD,
	appSecret: process.env.APP_SECRET,
	weatherApiKey: process.env.WEATHER_API_KEY,
	googleApiKey: process.env.GOOGLE_API_KEY,
	imagesBucket: process.env.TEST_IMAGES_BUCKET,
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// Production
config.production = {
	env: 'production',
	backendPort: process.env.BACKEND_PORT,
	dbName: process.env.PROD_DB_NAME,
	dbHost: process.env.PROD_DB_HOST,
	dbUser: process.env.PROD_DB_USER,
	dbPassword: process.env.PROD_DB_PASSWORD,
	appSecret: process.env.PROD_APP_SECRET,
	weatherApiKey: process.env.WEATHER_API_KEY,
	googleApiKey: process.env.GOOGLE_API_KEY,
	imagesBucket: process.env.PROD_IMAGES_BUCKET,
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}


module.exports = config;