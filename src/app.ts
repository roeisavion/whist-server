import { methodRouter } from "./methodrouter";
import { connectPlayer } from "./methods/connectPlayer";
import { initServer } from "./server";

const wsServer = initServer();
let clients = {}, games = {};
wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!")) // need to handel
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        methodRouter(connection,messageFromClient,clients, games)
    })
    connectPlayer(clients,connection)
})