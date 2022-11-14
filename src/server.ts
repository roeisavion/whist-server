import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import _ from 'lodash';

export const initServer = () => {
    const app: any = express()
    const httpServer = http.createServer(app);
    const websocketServer = ws.server;
    const wsServer = new websocketServer({
        httpServer
    })
    const port = process.env.PORT || 9091
    httpServer.listen(port, () => console.log(`Listening on http port ${port}`))

    return [wsServer ,app] ;
}

