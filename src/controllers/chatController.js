const express = require('express');
const auth = require('../middleware/auth');
const { Chat } = require('../model/chat');

const router = express.Router();

router.get('/getRoomId', auth, async (req, res) => {
    try {
        const id = req.query.userId;

    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/getMyMessages', auth, async (req, res) => {
    try {
        const id = req.query.roomId;
        console.log(id);
        const chat = await Chat.findById({ _id: id });
        res.status(200).send(chat.messages)
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

module.exports = router;