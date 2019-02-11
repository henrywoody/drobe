const localStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const selectUser = require('./select-user');

module.exports = new localStrategy({usernameField: 'email'}, async (email, password, cb) => {
    try {
        const user = await selectUser.byEmail(email, {includePassword: true});
        if (user) {
            try {
                const cryptResult = await bcrypt.compare(password, user.password);
                const correctPassword = !!cryptResult;

                if (correctPassword) {
                    const success = true;

                    const payload = {
                        sub: user.id
                    };

                    const token = jwt.sign(payload, global.config.appSecret);

                    const data = {};
                    for (const key in user) {
                        if (key !== 'password') {
                            data[key] = user[key];
                        }
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
});