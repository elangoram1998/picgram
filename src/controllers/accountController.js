const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const { Account } = require('../model/account');
const User = require('../model/users');
const { Image } = require('../model/image');
const { Message, Chat } = require('../model/chat');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

router.post('/changeAvatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        req.user.avatar = req.file.buffer;
        await req.user.save();
        res.status(200).send(req.user);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.patch('/updateAccount', auth, async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        if (keys.includes('email')) {
            const user = await User.findOne({ email: req.user.email });
            if (!user) {
                throw new Error('User not found');
            }
            user.email = req.body['email'];
            await user.save();
        }
        keys.forEach(async (key) => req.user[key] = req.body[key]);
        await req.user.save();
        res.status(200).send(req.user);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/getFriends', auth, async (req, res) => {
    try {
        const toBeExcluded = req.user.followings;
        toBeExcluded.push(req.user._id);
        const users = await Account.find().select('_id username avatar');
        const usersArray = Object.values(users);
        const newFriends = [];
        for (let i = 0; i < usersArray.length; i++) {
            if (!toBeExcluded.includes(usersArray[i]._id)) {
                newFriends.push(usersArray[i]);
            }
        }
        res.status(200).send(newFriends);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/addFriend', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
            throw new Error('User id is not valid');
        }
        const newFriend = req.body.userId;
        req.user.followings.push(newFriend);
        await req.user.save();
        const chat = new Chat({
            users: [req.user._id, newFriend]
        });
        await chat.save();
        req.user.chatRoom.push({
            user: newFriend,
            roomId: chat._id
        });
        await req.user.save();
        const myFriend = await Account.findById({ _id: req.body.userId });
        myFriend.followers.push(req.user._id);
        await myFriend.save();
        res.status(200).send(req.user);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/getMyFeed', auth, async (req, res) => {
    try {
        const usersArray = req.user.followings;
        usersArray.push(req.user._id);
        const feeds = await Image.getMyFeed(usersArray);
        res.status(200).send(feeds);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/likePost', auth, async (req, res) => {
    try {
        const imageId = req.body.imageId;
        const likedOrNot = req.body.likedOrUnliked;
        const post = await Image.findById(imageId);
        if (likedOrNot) {
            req.user.likedPosts.push(imageId);
            post.likes = post.likes + 1;

        } else {
            const imageIndex = req.user.likedPosts.findIndex(post => post == imageId);
            req.user.likedPosts.splice(imageIndex, 1);
            post.likes = post.likes - 1;
        }
        await post.save();
        await req.user.save();
        res.status(200).send(req.user);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/findUser', auth, async (req, res) => {
    try {
        const userID = req.query.uId;
        const user = await Account.findById(userID).select('username avatar')
        res.status(200).send(user);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/savePost', auth, async (req, res) => {
    try {
        const postId = req.body.postId;
        const saveOrUnSave = req.body.savedOrUnsaved;
        if (saveOrUnSave) {
            req.user.savedImages.push(postId);
        }
        else {
            const index = req.user.savedImages.findIndex(id => id == postId);
            if (index >= 0) {
                req.user.savedImages.splice(index, 1);
            }
        }
        await req.user.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/getMyPost', auth, async (req, res) => {
    try {
        const posts = await Account.findById(req.user._id).populate({
            path: 'posts',
            model: 'Image',
            populate: {
                path: 'comments',
                model: 'CommentSet'
            }
        }).select('posts');
        res.status(200).send(posts);
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/getMySavedPost', auth, async (req, res) => {
    try {
        const posts = await Account.findById(req.user._id).populate('savedImages').select('savedImages');
        res.status(200).send(posts);
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})


module.exports = router;