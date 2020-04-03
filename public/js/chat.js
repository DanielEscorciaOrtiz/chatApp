/* --------------- Chat --------------- */

"use strict";

{
    /* --------------- WebSocket --------------- */

    const socket = io();

    /* --------------- HTML elements --------------- */

    const
        $messageForm = document.getElementById("messageForm"),
        $messageTextbox = $messageForm.querySelector("input"),
        $messageButton = $messageForm.querySelector("button"),
        $shareLocation = document.getElementById("shareLocation"),
        $messages = document.getElementById("messages"),
        $sidebar = document.getElementById("sidebar");

    /* --------------- Templates --------------- */

    const
        messageTemplate = document.getElementById("messageTemplate").innerHTML,
        locationTemplate = document.getElementById("locationTemplate").innerHTML,
        sidebarTemplate = document.getElementById("sidebarTemplate").innerHTML;

    /* --------------- Options --------------- */

    const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

    const autoscroll = function () {
        // Get new message element
        const $newMessage = $messages.lastElementChild;
        // Height of the new message
        const
            newMessageStyles = getComputedStyle($newMessage),
            newMessageMargin = parseInt(newMessageStyles.marginBottom),
            newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

        // Visible height and Container height
        const
            visibleHeight = $messages.offsetHeight,
            containerHeight = $messages.scrollHeight;

        // Scrolling position 
        const scrollOffset = $messages.scrollTop + visibleHeight;

        // Only autoscroll if on newwest message
        if (containerHeight - newMessageHeight <= scrollOffset + 1) {
            $messages.scrollTop = $messages.scrollHeight;
        }
    }

    /* --------------- HTML Event listeners --------------- */

    $messageForm.addEventListener("submit", () => {
        event.preventDefault();

        $messageButton.setAttribute("disabled", "disabled");

        // Websocket event with aknowledgement
        socket.emit("sendMessage", event.target.elements.message.value, (error) => {

            $messageButton.removeAttribute("disabled");
            $messageTextbox.value = "";
            $messageTextbox.focus();

            if (error) return alert(`The message was rejected. ${error}`);
            console.log("Message delivered");
        });
    });

    $shareLocation.addEventListener("click", () => {
        if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");

        $shareLocation.setAttribute("disabled", "disabled");

        navigator.geolocation.getCurrentPosition((position) => {

            // Websocket event with aknowledgement
            socket.emit("sendLocation", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                shareLocation.removeAttribute("disabled");
                console.log("Location shared successfully");
            });

        });
    });
    /* --------------- Socket Event listeners --------------- */

    socket.emit("join", { username, room }, (error) => {
        if (error) {
            alert(error);
            location.href = "/";
        }
    });

    socket.on("message", (message) => {
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            username: message.username,
            createdAt: moment(message.createdAt).format("h:mm a")
        });
        $messages.insertAdjacentHTML("beforeend", html);
        autoscroll();
    });

    socket.on("locationMessage", (message) => {
        const html = Mustache.render(locationTemplate, {
            username: message.username,
            url: message.url,
            username: message.username,
            createdAt: moment(message.createdAt).format("h:mm a")
        });
        $messages.insertAdjacentHTML("beforeend", html);
        autoscroll();
    });

    socket.on("roomData", ({ room, users }) => {
        const html = Mustache.render(sidebarTemplate, {
            room,
            users
        });
        $sidebar.innerHTML = html;
    });
}
