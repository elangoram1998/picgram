const epxress = require('express');
const cors = require('cors');
const config = require('config');
const http = require('http');
const socketio = require('socket.io');
require('./database/db');
const authController = require('./controllers/authController');
const accountController = require('./controllers/accountController');
const postController = require('./controllers/postController');
const chatController = require('./controllers/chatController');
const WebSocket = require('./utils/webSocket');

const app = epxress();
const server = http.createServer(app);

app.use(epxress.json());
app.use(cors({
    origin: config.get('cors.origin')
}));

global.io = socketio(server, {
    cors: {
        origin: 'http://localhost:4200'
    }
})
io.on('connection', WebSocket.connection)
app.use('/api/v1/auth', authController);
app.use('/api/v1/account', accountController);
app.use('/api/v1/post', postController);
app.use('/api/v1/chat', chatController);

const PORT = process.env.PORT || config.get('server.port');
server.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})