/* --------------- Index --------------- */

"use strict";

{
    console.clear();

    /* --------------- Import server --------------- */

    const server = require("./server");

    /* --------------- Get server running --------------- */

    server.listen(process.env.PORT, function () {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}