import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import router from './router';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
    credentials: true,
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json()); 

const server = http.createServer(app);

//vgKH2tzLd3VV5rey
server.listen(8080, () => {
    console.log("Servidor rodando em http://localhost:8080");
});

const MONGO_URL = '' //Adicione a sua URI

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) =>{
    console.log("MONGODB Connection error", error);
})

app.use('/', router());
