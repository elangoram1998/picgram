const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
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
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    }
}, {
    timestamps: true
});

const commentSetSchema = new mongoose.Schema({
    text: commentSchema,
    replys: [commentSchema]
}, {
    timestamps: true
});

commentSchema.statics.findCommentsByPostId = async function (postId) {
    const comments = await Comment.find({
        post: postId
    });
    return comments;
}

const Comment = mongoose.model('Comment', commentSchema);

const CommentSet = mongoose.model('CommentSet', commentSetSchema);

module.exports = {
    commentSchema,
    Comment,
    commentSetSchema,
    CommentSet
}