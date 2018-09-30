const	createError		= require('http-errors'),
		express			= require('express'),
		path			= require('path'),
		cookieParser	= require('cookie-parser'),
		logger			= require('morgan'),
		passport		= require('passport'),
		localStrategy	= require('passport-local'),
		jwt				= require('jsonwebtoken'),
		cors			= require('cors'),
		handleErrors	= require('./modules/handle-db-errors'),
		bcrypt			= require('bcrypt');

global.config = require('./config')[process.env.NODE_ENV];

const	indexRouter	= require('./routes/index'),
		usersRouter	= require('./routes/users'),
		apiRouter	= require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
if (global.config.env === 'production') {
	app.set('trust proxy', true);
	app.use((req, res, next) => {
		if (req.hostname !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
			return res.redirect(`https://${req.host}${req.url}`);
		}
		next();
	})
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// ==============
// Authentication
// ==============
const selectUser = require('./modules/select-user');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy({usernameField: 'email'}, async (email, password, cb) => {
	try {
		const user = await selectUser.byEmail(email, {includePassword: true});
		if (user) {
			try {
				const cryptResult = await bcrypt.compare(password, user.password);

				if (cryptResult) { // passwords match
					const success = true;

					const payload = {
						sub: user.id
					};

					const token = jwt.sign(payload, global.config.appSecret);

					const data = {};
					for (const key in user) {
						if (key !== 'password')
							data[key] = user[key];
					}

					const info = {
						message: 'Login Successful',
						token,
						userData: data
					};

					cb(null, success, info);
				} else {
					const err = new Error('Incorrect password.')
					err.name = 'IncorrectPasswordError';
					cb(err);
				}
			} catch (err) {
				cb(err);
			}
		} else {
			const err = new Error('Incorrect email.');
			err.name = 'IncorrectEmailError';
			cb(err);
		}
	} catch (err) {
		cb(err);
	}
}));

passport.serializeUser((user, cb) => {
	cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
	try {
		const user = await selectUser.byId(id);
		cb(null, user);
	} catch (err) {
		console.log(err);
	}
});
// ==============


app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
