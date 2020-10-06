var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(process.env.PORT || 3000);

/* USER TEMPLATE */

function template(id){
    if (!id) id = "";
    return {
        id: id,
        color: "#000000",
        x: 0, y: 0, mx: 0, my: 0
    }
}

/* ONLINE USER LIST */

var users = {

}

/* MOVEMENT + PLAYER SYSTEM */
/* INFO:
   i mean, it's just the movement system basically.
   enough said.
*/

io.on('connection', (socket) => {
    console.log("User Connected");
    var user = new template(socket.id);
    user.color = "#" + Math.floor(Math.random()*16777215).toString(16);
    user.id = socket.id;
    users[socket.id] = user;
    /* on player leaving */
    socket.on("disconnect", ()=>{
        io.emit("updatePosition", {id: socket.id, color:"#000000", x:0,y:270});
        // hacky but it works, i mean it's a snap game ^
        delete users[socket.id];
        console.log("User Disconnected");
    })
    /* movement packet */
    socket.on("updatePosition", (data)=> {
        users[socket.id].x = data.contents[0]
        users[socket.id].y = data.contents[1]
        users[socket.id].mx = data.contents[2]
        users[socket.id].my = data.contents[3]
        io.emit("updatePosition", users[socket.id])
    })
    /* depricated */
    socket.on("updateRot", (data)=>{
        console.log("ROT")
        users[socket.id].rot = data
        io.emit("updatePosition", users[socket.id])
    })
    io.emit('userJoin', users[socket.id])
    /* tell the joining player all other players online */
    Object.keys(users).forEach(u => {
        if (users[u].id !== socket.id){
            socket.emit('userJoin', users[u]);
        }
    });
})

/* BASIC AI BOT */
/* INFO:
   basically this bot moves up and down
   it's look direction is 100% random
*/

var bot = new template("BOT");
users["BOT"] = bot;
users["BOT"].y = 25;


setInterval(function(){
    users["BOT"].color = "#" + Math.floor(Math.random()*16777215).toString(16);
    io.emit("updatePosition", users["BOT"])
}, 100)



function down(){
    setTimeout(function(){
        users["BOT"].y--;
        io.emit("updatePosition", users["BOT"])
        if (users["BOT"].y > 0){
            down();
        } else {
            up();
        }
        users["BOT"].mx = Math.floor(Math.random() * 270);
        users["BOT"].my = Math.floor(Math.random() * 270);
        if (Math.random() > 0.5) {
            users["BOT"].my*=-1;
        } else {
            users["BOT"].mx*=-1;
        }
    },100)
}

function up(){
    setTimeout(function(){
        users["BOT"].y++;
        io.emit("updatePosition", users["BOT"])
        if (users["BOT"].y < 25){
            up();
        } else {
            down();
        }
        users["BOT"].mx = Math.floor(Math.random() * 270);
        users["BOT"].my = Math.floor(Math.random() * 270);
        if (Math.random() > 0.5) {
            users["BOT"].mx*=-1;
        } else {
            users["BOT"].my*=-1;
        }
        
    },100)
}

down();

