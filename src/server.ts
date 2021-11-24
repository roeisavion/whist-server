import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import _ from 'lodash'; 

export const initServer = () => {
    const httpServer = http.createServer();
    httpServer.listen(9090, () => console.log("Listening.. on 9090"))
    const app : any = express()
    let port; 
    (process.env.PORT==null || process.env.PORT =="") ? port = 9091 : port = process.env.PORT ;
    app.listen(port, () => console.log("Listening on http port 9091"))
    const websocketServer = ws.server;
    const wsServer = new websocketServer({
        "httpServer": httpServer
    })
    
    return wsServer;
}
