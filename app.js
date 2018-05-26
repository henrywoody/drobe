const	createError		= require('http-errors'),
		express			= require('express'),
		path			= require('path'),
		cookieParser	= require('cookie-parser'),
		logger			= require('morgan'),
		expressSession	= require('express-session'),
		mongoose		= require('mongoose'),
		User			= require('./models/user'),
		passport		= require('passport'),
		localStrategy	= require('passport-local'),
		passportLocalMongoose = require('passport-local-mongoose'),
		jwt				= require('jsonwebtoken'),
		cors			= require('cors'),
		handleErrors	= require('./modules/handle-db-errors');

global.config = require('./config')[process.env.NODE_ENV];

const	indexRouter	= require('./routes/index'),
		usersRouter	= require('./routes/users'),
		apiRouter	= require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// ==============
// Authentication
// ==============
mongoose.connect(global.config.dbHost);

app.use(expressSession({
	secret: global.config.appSecret,
	saveUninitialized: false,
	resave: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(async (username, password, done) => {
	const result = await User.authenticate()(username, password);
	
	if (result.error)
		return done(result.error);

	const { user } = result;
	const token = await jwt.sign({sub: user._id}, global.config.appSecret);

	const info = { user, token };

	return done(null, info);
}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

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
