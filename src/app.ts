import { clientIdByConnection } from "./helpers/helpers";
import { methodRouterClass } from "./methodrouter";
import { leaveGame } from "./methods/leaveGame";
import { initServer } from "./server";

const [wsServer, app] = initServer();
const router = new methodRouterClass();
wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    //need to give connection clientID
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => {
        let clientId = clientIdByConnection(router.clients, connection)
        leaveGame(clientId, router.clients, { clientId }, router.games)
        console.log("closed!");
    }) // need to handel
    connection.on("message", message => {
        const messageFromClient = JSON.parse(message.utf8Data)
        router.methodRouter(messageFromClient)
    })
    router.connectPlayer(connection)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/games', (req, res) => {
    res.send(router.games)
})