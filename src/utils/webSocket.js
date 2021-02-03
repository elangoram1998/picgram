const { Chat, Message } = require("../model/chat");

class WebSocket {
    socket;

    connection(socket) {
        socket.emit('newEvent', "welcome to the application")
        console.log("new Connection occured");

        socket.on('join', ({ room }) => {
            console.log(room)
            socket.join(room);
            global.io.to(room).emit('message', "welcome to my application")
        });

        socket.on('sendMessage', async({ room, message }, callback) => {
            console.log(room + " " + message);
            const messages = new Message({
                text: message
            });
            await messages.save();
            const chat = await Chat.findById({ _id: room });
            chat.messages.push(messages);
            await chat.save();
            global.io.to(room).emit('message', message);
            callback("message send successfully");
        })

        socket.on('disconnect', () => {
            console.log("connection disconneted")
        });
    }
}

module.exports = new WebSocket();