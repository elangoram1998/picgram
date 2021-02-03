const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    text: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    });

const chatSchema = new mongoose.Schema({
    users: {
        type: [String],
        required: true,
        minlength: 2
    },
    messages: [messageSchema]
});


const Message = mongoose.model('Message', messageSchema);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = {
    Message,
    Chat
}