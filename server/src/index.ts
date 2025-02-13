import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { ServerService } from './server/ServerService';


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);
ServerService.getInstance().init(httpServer);

app.get('/', async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
        message: 'Hello World!',
    });
});

try {
    httpServer.listen(PORT, (): void => {
        console.log(`Connected successfully on port ${PORT}`);
    });
} catch (error: any) {
    console.error(`Error occurred: ${error.message}`);
}

