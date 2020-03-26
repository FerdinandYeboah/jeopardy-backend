var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = 3001

// Make root path act like a health check
app.get('/', (req, res) => res.send('Backend Jeopardy Server is Up!'))

http.listen(port, function(){
    console.log(`Backend jeopardy server listening on port ${port}`);
  });

// Listen for all socket connections, and then mount listeners
io.on('connection', function(socket){
  console.log('a user connected: ', socket.id);
});
