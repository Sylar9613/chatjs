const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat-database', {
    useNewUrlParser: true
})
    .then(db => console.log('db connected'))
    .catch(err => console.log(err));

// db connection
/* mongoose.connect('mongodb://localhost/chat-database')
    .then(db => console.log('db is connected'))
    .catch(err => console.log(err)); */