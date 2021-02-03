const express = require('express');
const { Account } = require('../model/account');
const User = require('../model/users');
const auth = require('../middleware/auth');
const validateAction = require('../middleware/isCodeValidated');
const sendEmail = require('../common/nodemailer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/signInUser', async (req, res) => {
    try {
        console.log(req.body);
        const user = await Account.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateToken();
        res.status(200).send({
            user, token
        });
    }
    catch (e) {
        console.log(e);
        res.status(401).send({ 'Error': e });
    }
});

router.post('/signUpUser', async (req, res) => {
    try {
        const image = fs.readFileSync(__dirname + '/../../images/Profile_avatar.png');
        req.body.avatar = image;
        const user = await Account.isUsernameExist(req.body.username);
        if (user) {
            return res.status(400).send('Username already taken, please try another username')
        }
        const account = new Account(req.body);
        await account.save();
        const users = new User({ email: req.body.email });
        await users.save();
        var toAdress = account.email;
        var subject = "Welcome Message";
        var text = `Thank you ${account.username} for signing up with my application.`;
        var html = `<b>(${account.username})</b>`;
        const messageId = sendEmail(toAdress, subject, text, html);
        if (!messageId) {
            throw new Error('Failed to send email');
        }
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send({ 'Error': e });
    }


});

router.get('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token != req.token);
        await req.user.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send({ 'Error': e });
    }
});

router.get('/checkUsername', async (req, res) => {
    try {
        console.log(req.query);
        const username = req.query.username;
        const user = await Account.findOne({ username });
        if (user) {
            res.status(200).send(true);
        }
        else {
            res.status(200).send(false);
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

router.post('/forgotPassword', async (req, res) => {
    try {
        const email = req.body.email;
        const user = await Account.findOne({ email });
        if (!user) {
            throw new Error('User not found with this email ID');
        }
        const code = (Math.floor(1000 + Math.random() * 9000)).toString();
        console.log("Generated code: " + code);
        var toAdress = email;
        var subject = "Password Reset";
        var text = `Sorry to hear you're having trouble logging into the Application. Please enter this (${code}) code to get into the application`;
        var html = `<b>(${code})</b>`;
        // const messageId = sendEmail(toAdress, subject, text, html);
        // if (!messageId) {
        //     throw new Error('Failed to send email');
        // }
        const users = await User.findOne({ email });
        users.forgotPasswordCode = code;
        await users.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send({ 'Error': e });
    }
});

router.post('/validateCode', async (req, res) => {
    try {
        const code = req.body.code;
        const email = req.body.email;
        const isMatch = await User.findOne({ email, forgotPasswordCode: code });
        if (!isMatch) {
            throw new Error('Code did not match');
        }
        const token = await isMatch.generateToken();
        res.status(200).send(token);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/changePassword', validateAction, async (req, res) => {
    try {
        const email = req.user.email;
        const account = await Account.findOne({ email });
        account.password = req.body.password;
        await account.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

module.exports = router;