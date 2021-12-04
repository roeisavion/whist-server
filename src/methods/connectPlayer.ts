import { clientGuid } from "../helpers/guid";

export const connectPlayer = (clients, connection) => {
    const clientId = clientGuid();

    clients[clientId] = {
        connection
    }

    let payLoad = {
        "method": "connect",
        "clientId": clientId
    }
    //send back the client connect
    connection.send(JSON.stringify(payLoad))
}