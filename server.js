
const express = require('express');
const socket = require('socket.io');

const SERVER_PORT = 80;
const SOCKET_PORT = 3000;

const app = express();
const io = require('socket.io')(SOCKET_PORT);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a device connected');

    socket.on('*', function(event,data) {
        console.log(`Received ${event}: ${data}`);
    });

    socket.on('disconnect', function(){
        console.log('device disconnected');
    });

    socket.on('/test', function() {
        console.log('TEST')
    })
    //right now expecting value between 0-100
    socket.on('/client/update', (id, value ) => {
        console.log('update', id, value);
        io.emit('/game/update', id, value);
    })
});

app.listen(SERVER_PORT, () => console.log(`SERVER listening on port ${SERVER_PORT}`));
