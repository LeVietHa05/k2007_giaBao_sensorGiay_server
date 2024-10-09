const option = {
    allowEIO3: true,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true,
    },
}
const io = require("socket.io")(option);
const { time } = require("console");
const fs = require("fs");

let data = JSON.parse(fs.readFileSync("data.json"));
fs.watchFile("data.json", (curr, prev) => {
    console.log("data.json changed");
    data = JSON.parse(fs.readFileSync("data.json"));
});

console.log(data)

const socketapi = {
    io: io
}

io.on("connection", (socket) => {
    console.log("[INFO] new connection: [" + socket.id + "]",
        socket.request.connection.remoteAddress);
    socket.on("message", async (newData) => {
        console.log(`[message] from ${newData.clientID} via socket id: ${socket.id}`);
        socket.broadcast.emit("message", {
            clientID: newData.clientID,
            temp: newData.temp.toFixed(2),
            humi: newData.humi.toFixed(2),
            time: (new Date()).toLocaleString('vi-vn')
        });
        data.push({
            clientID: newData.clientID,
            temp: newData.temp.toFixed(2),
            humi: newData.humi.toFixed(2),
            time: (new Date()).toLocaleString('vi-vn')
        })
        fs.writeFileSync("data.json", JSON.stringify(data));
    });

    socket.on("web-get-data", () => {
        console.log("web-get-data");
        socket.emit("web-send-data", data);
    });
    /**************************** */
    //xu ly chung
    socket.on("reconnect", function () {
        console.log("[" + socket.id + "] reconnect.");
    });
    socket.on("disconnect", () => {
        console.log("[" + socket.id + "] disconnect.");
    });
    socket.on("connect_error", (err) => {
        console.log(err.stack);
    });
})

module.exports = socketapi;