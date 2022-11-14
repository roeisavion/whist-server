import https from 'https';
import http from 'http';
import * as ws from 'websocket';
import express from 'express';
import fs from 'fs';
import _ from 'lodash';

export const initServer = () => {
    const app: any = express()

    const credentials  = {
        key: fs.readFileSync('./myCA.pem'),
        cert: fs.readFileSync('./myCA.key')
      };

    const httpServer = https.createServer(credentials,app)
    // const httpServer = http.createServer(app);
    const websocketServer = ws.server;
    const wsServer = new websocketServer({
        httpServer
    })
    const port = process.env.PORT || 9091
    httpServer.listen(port, () => console.log(`Listening on http port ${port}`))

    return [wsServer ,app] ;
}

