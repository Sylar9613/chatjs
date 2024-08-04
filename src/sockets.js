const { Socket } = require("net");
const { async } = require("rxjs/internal/scheduler/async");
const Chat = require('./models/Chat');

module.exports = function (io) {
    let users = {};

    io.on('connection', async socket => {
        //console.log('New user connected');

        let messages = await Chat.find({}).limit(8).sort('-created_at');
        socket.emit('load old msgs', messages);

        socket.on('new user', (data, cb) => {
            if(data in users){
                cb(false);
            }
            else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
        });

        // receive a message a broadcasting
        socket.on('send message', async (data, cb) => {
            var msg = data.trim();

            if (msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                var index = msg.indexOf(' ');
                if (index !== -1) {
                    var name = msg.substr(0, index);
                    var msg = msg.substr(index + 1);
                    if (name in users) {
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error! Enter a valid User');
                    }
                } else {
                    cb('Error! Please enter your message');
                }
            } else {
                var newMsg = new Chat({
                    nick: socket.nickname,
                    msg
                });

                await newMsg.save();

                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                });   
            }
        });

        socket.on('disconnect', data => {
            if (!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
        });
        
        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
}