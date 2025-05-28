import http from "http";
import WebSocket from "ws";
import express from "express";
import livereloadMiddleware from "connect-livereload";
import livereload from "livereload";
const liveServer = livereload.createServer({
  exts: ["js", "pug", "css"],
  delay: 1000,
});

liveServer.watch(__dirname);

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.use(livereloadMiddleware());

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handlelisten = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";

  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("Disconnected from the Browser ❌"));

  socket.on("message", (message) => {
    const msg = JSON.parse(message.toString());
    switch (msg.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${msg.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = msg.payload;
        break;
    }
  });
});

server.listen(3000, handlelisten);
