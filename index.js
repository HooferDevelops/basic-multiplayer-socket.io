var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(process.env.PORT || 3030);

/* ONLINE USER LIST */

var users = {}
var playerindex = 0

/* USER TEMPLATE */

function template(id){
    if (!id) id = "";
    playerindex += 1
    return {
        id: id,
        index: playerindex,
        y: 0,
        dir: 0,
    }
}

/* MOVEMENT + PLAYER SYSTEM */
/* INFO:
   i mean, it's just the movement system basically.
   enough said.
*/

io.on('connection', (socket) => {
    console.log("User Connected");
    var user = new template(socket.id);
    user.id = socket.id;
    users[socket.id] = user;
    /* on player leaving */
    socket.on("disconnect", ()=>{
        io.emit("stop", {})
        delete users[socket.id];
        console.log("User Disconnected");
    })
    /* paddle movement */
    socket.on("paddle", (data)=> {
        users[socket.id].y = data.contents[0]
        users[socket.id].dir = data.contents[1]
        io.emit("paddle", users[socket.id])
    })
    /* ball movement */
    socket.on("ball", (data)=> {
        io.emit("ball", {
            x: data.contents[0],
            y: data.contents[1]
        })
    })
    /* dubs */
    socket.on("score", (data)=> {
        io.emit("score", {
            blue: data.contents[0],
            red: data.contents[1]
        })
    })
    io.emit('join', users[socket.id])
    /* tell the joining player all other players online */
    Object.keys(users).forEach(u => {
        if (users[u].id !== socket.id){
            socket.emit('join', users[u]);
        }
    });
})