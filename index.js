var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(process.env.PORT || 3030);

/* USER TEMPLATE */

function template(id){
    if (!id) id = "";
    return {
        id: id,
        y: 0,
        dir: 0,
    }
}

/* ONLINE USER LIST */

var users = {}

/* MOVEMENT + PLAYER SYSTEM */
/* INFO:
   i mean, it's just the movement system basically.
   enough said.
*/

io.on('connection', (socket) => {
    console.log("User Connected");
    var user = new template(socket.id);
    user.id = socket.id;
    /* on player leaving */
    socket.on("disconnect", ()=>{
        io.emit("updatePosition", {id: socket.id, y:360, dir: 0});
        // hacky but it works, i mean it's a snap game ^
        delete users[socket.id];
        console.log("User Disconnected");
    })
    /* movement packet */
    socket.on("updatePosition", (data)=> {
        users[socket.id].y = data.contents[0]
        users[socket.id].dir = data.contents[1]
        io.emit("updatePosition", users[socket.id])
    })
    io.emit('userJoin', users[socket.id])
    /* tell the joining player all other players online */
    Object.keys(users).forEach(u => {
        if (users[u].id !== socket.id){
            socket.emit('userJoin', users[u]);
        }
    });

    users[socket.id] = user;
})