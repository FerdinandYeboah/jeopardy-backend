import { EventHandler } from "./handlers/EventHandlers";

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = 3001

// Make root path act like a health check
app.get('/', (req: any, res: any) => res.send('Backend Jeopardy Server is Up!'))

http.listen(port, function(){
    console.log(`Backend jeopardy server listening on port ${port}`);
  });

// Listen for all socket connections, and then mount listeners
io.on('connection', function(socket: any){
  // console.log('interior this: ', this); // Apparently 'this' is the io object?
  console.log('a user connected: ', socket.id);

  const handlers = new EventHandler(socket);

  //Set event handlers and bind to handlers object so that 'this' variable contains socket. Referencing exported functions outside of class changes the this by default
  socket.on("userCreated", handlers.userCreated.bind(handlers))
  socket.on("roomListRequested", handlers.roomListRequested.bind(handlers))
});

