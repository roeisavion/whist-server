import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import _ from 'lodash'; 

export const initServer = () => {
    const app : any = express()
    const httpServer = http.createServer(app);
    // httpServer.listen(9090, () => console.log("Listening.. on 9090"))
    const websocketServer = ws.server ;
    const wsServer = new websocketServer({
        httpServer
    })
    const port =  process.env.PORT || 9091
    // (process.env.PORT==null || process.env.PORT =="") ? port = 9091 : port = process.env.PORT ;
    httpServer.listen(port, () => console.log(`Listening on http port ${port}`))
    
    return wsServer;
}
