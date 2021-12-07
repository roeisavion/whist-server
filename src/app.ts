import { clientIdByConnection } from "./helpers/helpers";
import { methodRouter1 } from "./methodrouter";
import { leaveGame } from "./methods/leaveGame";
import { initServer } from "./server";

const wsServer = initServer();
const router = new methodRouter1();
wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => {
        let clientId = clientIdByConnection(router.clients,connection)
        leaveGame(clientId,router.clients,{clientId},router.games)
        console.log("closed!");
    }) // need to handel
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        router.methodRouter(messageFromClient)
    })
    router.connectPlayer(connection)
})