/* --------------- Users module --------------- */

"use strict";

{
    const users = [];

    const addUser = function ({ id, username, room }) {

        username = username.trim();
        room = room.trim();

        // Check for nulls
        if (!username || !room) return { error: "Username and Room are required" };

        // Check for existing user
        const existingUser = users.find((user) => user.room === room && user.username === username);
        if (existingUser) return { error: "Username is in use" };

        // Store user
        const user = { id, username, room };
        users.push(user);

        return { undefined, user };
    }

    const removeUser = function (id) {
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            return users.splice(index, 1)[0];
        }
    }

    const getUser = function (id) {
        return users.find((user) => user.id === id);
    }

    const getUsersInRoom = function (room) {
        return users.filter((user) => user.room === room);
    }

    module.exports = {
        addUser,
        removeUser,
        getUser,
        getUsersInRoom
    };
}