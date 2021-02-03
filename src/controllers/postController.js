const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');
const { Account } = require('../model/account');
const { Image } = require('../model/image');
const { Comment, CommentSet } = require('../model/comments');
const { findById } = require('../model/users');

const router = express.Router();

router.post('/newPost', auth, upload.single('post'), async (req, res) => {
    try {
        const post = new Image({
            image: req.file.buffer,
            fileTye: req.file.mimetype,
            caption: req.body.caption,
            owner: req.user._id
        });
        await post.save();
        req.user.posts.push(post._id);
        await req.user.save();
        res.status(200).send(post._id);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/addComment', auth, async (req, res) => {
    try {
        const postId = req.body.postId;
        const text = req.body.text;
        const post = await Image.findById(postId);
        const newComment = new Comment({
            text,
            owner: req.user._id,
            post: postId
        });
        await newComment.save();
        const commentSet = new CommentSet({
            text: newComment
        });
        await commentSet.save();
        post.comments.push(commentSet._id);
        await post.save();
        res.status(200).send(commentSet);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/addReply', auth, async (req, res) => {
    try {
        const postId = req.body.postId;
        const text = req.body.text;
        const parentCommentId = req.body.parentId;
        //const post = await Image.findById(postId);
        const newComment = new Comment({
            text,
            owner: req.user._id,
            post: postId
        });
        await newComment.save();
        const commentSet = await CommentSet.findById(parentCommentId);
        commentSet.replys.push(newComment);
        await commentSet.save();
        res.status(200).send(newComment);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/addLike', auth, async (req, res) => {
    try {
        const postId = req.body.postId;
        const likedOrNot = req.body.likedOrUnliked;
        const comment = await Comment.findById(postId);
        if (likedOrNot) {
            comment.likes = comment.likes + 1;
        }
        else {
            comment.likes = comment.likes - 1;
        }
        await comment.save();
        res.status(200).send(true)
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.put('/deleteComment', auth, async (req, res) => {
    try {
        const postID = req.query.pId;
        const commentID = req.query.cId;
        const isCmdOrRpy = req.body.isCmdOrRpy;
        const post = await Image.getPostComments(postID);
        if (isCmdOrRpy == 'cmd') {
            const cmdIndex = post.comments.findIndex(comment => comment._id == commentID);
            post.comments.splice(cmdIndex, 1);
        }
        else if (isCmdOrRpy == 'rpy') {
            const length = post.comments.length;
            for (let i = 0; i < length; i++) {
                const cmdIndex = post.comments[i].replys.findIndex(reply => reply._id == commentID);
                if (cmdIndex >= 0) {
                    const parentCommentId = post.comments[i]._id;
                    const parentComment = await CommentSet.findById(parentCommentId);
                    parentComment.replys.splice(cmdIndex, 1);
                    await parentComment.save();
                    break;
                }
            }
        }
        await post.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(false);
    }
});

router.delete('/deletePost', auth, async (req, res) => {
    try {
        const postId = req.query.pId;
        const post = await Image.findByIdAndDelete(postId);
        if (!post) {
            return res.status(400).send('no post to delete');
        }
        res.status(200).send(post);
    }
    catch (e) {
        console.log(e);
        res.status(200).send(e);
    }
});

module.exports = router;
