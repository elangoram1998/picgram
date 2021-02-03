const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { commentSchema,
    Comment,
    commentSetSchema,
    CommentSet } = require('./comments');

const imageSchema = new mongoose.Schema({
    image: {
        type: Buffer,
        required: true
    },
    fileTye: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        maxlength: 1000
    },
    likes: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    imageUrl: {
        type: String,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentSet'
    }]
}, {
    timestamps: true
});

// imageSchema.virtual('imageUrl').get(function () {
//     var img = new Buffer(this.image.buffer, 'binary').toString('base64');
//     return img;
// })

imageSchema.pre('save', async function (next) {
    const post = this;
    post.imageUrl = new Buffer(post.image.buffer, 'binary').toString('base64');
    next();
})

imageSchema.statics.getMyFeed = async function (usersArray) {
    const feeds = await Image.find({
        'owner': {
            $in: usersArray
        },
        'createdAt': {
            $gte: moment().startOf('day').toDate(),
            $lte: moment().format()
        }
    }).populate('comments').sort({ createdAt: -1 });

    return feeds;
}

imageSchema.statics.getPostComments = async function (postID) {
    const post = await Image.findById(postID).populate('comments');
    return post;
}

imageSchema.statics.getComments = async function (postId) {
    const comments = await Image.findById(postId).populate({

    });
    return comments;
}

const Image = mongoose.model('Image', imageSchema);

module.exports = {
    Image,
    imageSchema
}