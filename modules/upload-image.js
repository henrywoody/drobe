const	multer = require('multer'),
		aws = require('aws-sdk'),
		multerS3 = require('multer-s3');

const credentials = new aws.Credentials(global.config.awsAccessKeyId, global.config.awsSecretAccessKey);
const s3 = new aws.S3({credentials: credentials});

module.exports = multer({
	storage: multerS3({
		s3: s3,
		bucket: global.config.imagesBucket,
		acl: 'public-read',
		key: (req, file, cb) => {
			const [fileName, fileType] = file.originalname.split('.');
			const fileKey = `${fileName}-${Date.now()}.${fileType}`;
			cb(null, fileKey);
		}
	})
});