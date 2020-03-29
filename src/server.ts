var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
import { UserJoined } from "./models/Events";

const port = 3001

// Make root path act like a health check
app.get('/', (req: any, res: any) => res.send('Backend Jeopardy Server is Up!'))

http.listen(port, function(){
    console.log(`Backend jeopardy server listening on port ${port}`);
  });

// Listen for all socket connections, and then mount listeners
io.on('connection', function(socket: any){
  console.log('a user connected: ', socket.id);

  socket.on("userJoined", userJoined)
});



// Functions
function userJoined(data: UserJoined){
  console.log("userJoined server data: ", data)
}