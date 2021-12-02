import { methodRouter, methodRouter1 } from "./methodrouter";
import { connectPlayer } from "./methods/connectPlayer";
import { initServer } from "./server";

const wsServer = initServer();
const router = new methodRouter1();
// let clients = {}, games = {};
// let clientId, sliceingSuit ;
wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!")) // need to handel
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        // methodRouter(connection,messageFromClient,clients, games, clientId, sliceingSuit)
        router.methodRouter(messageFromClient)
    })
    router.connectPlayer(connection)
})