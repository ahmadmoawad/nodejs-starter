const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const config = require('../../config');
const logger = require('../../util/logger');

logger.log('config db url: ' + config.db.url);
mongoose.connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = this.encryptPassword(this.password);
    next();
});

UserSchema.methods = {
    authenticate: function (plainPassword) {
        return bcrypt.compareSync(plainPassword, this.password);
    },

    encryptPassword: function (plainPassword) {
        if (!plainPassword) {
            return '';
        } else {
            var salt = bcrypt.genSaltSync(10);
            return bcrypt.hashSync(plainPassword, salt);
        }
    },

    toJson: function () {
        var obj = this.toObject();
        delete obj.password;
        return obj;
    }
};

module.exports = mongoose.model('user', UserSchema);
