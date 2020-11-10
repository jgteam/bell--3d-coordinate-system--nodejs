const express = require('express');
const app = express();
const http = require('http').Server(app);
//var io = require('socket.io')(http);

const port = process.env.PORT || "3000";


app.get(['/', '/room'], function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/room/:id', function(req, res){
    res.sendFile(__dirname + '/base/index.html');
});

app.use('/room/:id', express.static('base'));

app.get('/api/socket', function(req, res){
    res.sendFile(__dirname + '/api/socket-client.js');
});

app.get('/api/:function/:parameter', function(req, res){
    res.json(
        {
            function: req.params.function,
            parameter: req.params.parameter
        }
    );
});


http.listen(port, function(){
    console.log('Listening on port ' + port);
});