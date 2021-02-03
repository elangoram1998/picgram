const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const validator = require('validator');

const accountSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value) || !validator.matches(value, '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')) {
                throw new Error('Email is invalid')
            }
        },
        //match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$/,'Email is invalid']
    },
    DOB: {
        type: Date,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        validate(value) {
            if (value) {
                if (!validator.matches(value, '[0-9 ]{10}')) {
                    throw new Error('Phone number is invalid');
                }
            }
        }
        //match: [/[0-9 ]{10}/, 'phone number is invalid']
    },
    avatar: {
        type: Buffer,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.matches(value, '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}')) {
                throw new Error('Password is invalid');
            }
        },
        //match: [/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}/, 'Password is invalid']
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    savedImages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image'
        }
    ],
    chatRoom: [
        {
            user: mongoose.Schema.Types.ObjectId,
            roomId: mongoose.Schema.Types.ObjectId
        }
    ]
}, { timestamps: true });

accountSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

accountSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

accountSchema.statics.findByCredentials = async function (username, password) {
    const user = await Account.findOne({ username: username });
    if (!user) {
        throw new Error("Account is not available");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Username/Password is incorrect");
    }
    return user;
}

accountSchema.statics.isUsernameExist = async (username) => {
    const user = await Account.findOne({ username });
    if (user) {
        return true;
    }
    return false;
}

accountSchema.methods.generateToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, config.get('tokenKey'));
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

const Account = mongoose.model('Account', accountSchema);

module.exports = {
    Account,
    accountSchema
}