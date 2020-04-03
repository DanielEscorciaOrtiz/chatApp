/* --------------- Server --------------- */

"use strict";

{
    /* --------------- Require modules --------------- */

    const
        path = require("path"),
        http = require("http"),
        express = require("express"),
        socketio = require("socket.io"),
        Filter = require("bad-words"),
        {
            generateMessage,
            generateLocationMessage } = require("./utils/messages"),
        {
            addUser,
            removeUser,
            getUser,
            getUsersInRoom } = require("./utils/users");

    /* --------------- Create server --------------- */

    const
        app = express(),
        server = http.createServer(app),
        io = socketio(server);

    /* --------------- Configure server --------------- */

    const publicDirectoryPath = path.join(__dirname, "../public");

    app.use(express.static(publicDirectoryPath));

    /* --------------- Connect Websocket --------------- */

    io.on("connection", (socket) => {

        /* --------------- Websocket events --------------- */


        // Connections

        socket.on("join", ({ username, room }, aknowledge) => {
            const { error, user } = addUser({
                id: socket.id,
                username,
                room
            });

            if (error) return aknowledge(error);

            socket.join(user.room);

            socket.emit("message", generateMessage("Admin", "Welcome!"));
            socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });

            aknowledge();
        });

        socket.on("disconnect", () => {
            const user = removeUser(socket.id);
            if (user) {
                io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));
                io.to(user.room).emit("roomData", {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                });
            }
        })

        // Messages

        socket.on("sendMessage", (message, aknowledge) => {
            const filter = new Filter();
            if (filter.isProfane(message)) {
                return aknowledge("No profanity allowed");
            }

            const user = getUser(socket.id);
            if (!user) return aknowledge("User not found");

            io.to(user.room).emit("message", generateMessage(user.username, message));
            aknowledge();
        });

        socket.on("sendLocation", (location, aknowledge) => {
            const user = getUser(socket.id);
            if (!user) return aknowledge("User not found");

            io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
            aknowledge();
        });

    });

    /* --------------- Export server --------------- */

    module.exports = server;
}
