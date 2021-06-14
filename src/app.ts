import 'reflect-metadata';
import express from 'express';
import createError from 'http-errors';
import {Request, Response, NextFunction} from "express";
import morgan from 'morgan';
import helmet from "helmet";
import cors from "cors";
import compression from 'compression';
import indexRouter from './routes';
import {initConnection} from "./db/connection";
import userRouter from "./routes/user";
import loginRouter from "./routes/login";
import postRouter from "./routes/post";
import replyRouter from "./routes/reply";
import uploadRouter from "./routes/upload";
import searchRouter from "./routes/search";
import notificationRouter from "./routes/notification";
import feedRouter from "./routes/feed";

// Initialize the expressjs
const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(helmet());
app.use(compression());
app.use(cors());

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/posts', postRouter);
app.use('/reply', replyRouter);
app.use('/upload', uploadRouter);
app.use('/search', searchRouter);
app.use('/notification', notificationRouter);
app.use('/feed', feedRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Creating connection to the database by using typeorm's createConnection
initConnection()
    .then(() => {
        console.log("Connection created successfully.");
    })
    .catch((e) => {
        console.log("Error initializing the connection!");
        console.log(e);
    });

export default app;
