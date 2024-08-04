const app = require('./app');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio.listen(server);
require('./sockets')(io);
require('./database');

async function main() { 
    //starting the server
    await server.listen(app.get('port'));
    console.log(`Server on port ${app.get('port')}`);
}

main();