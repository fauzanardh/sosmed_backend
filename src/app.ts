import 'reflect-metadata';
import express from 'express';
import createError from 'http-errors';
import {Request, Response, NextFunction} from "express";
import morgan from 'morgan';
import helmet from "helmet";
import compression from 'compression';
import {createConnection} from "typeorm";
import indexRouter from './routes';
import testApiRouter from './routes/testApi';
import tableTestApiRouter from './routes/tableTestApi'

// Initialize the expressjs
const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(helmet());
app.use(compression());

app.use('/api', indexRouter);
app.use('/api/v1', indexRouter);
app.use('/api/v1/test', testApiRouter);
app.use('/api/v1/table_test', tableTestApiRouter);

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
createConnection({
    "type": "postgres",
    "host": process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT, 10),
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "synchronize": true,
    "logging": false,
    "entities": [
        "src/models/entity/**/*.ts"
    ],
    "migrations": [
        "src/models/migration/**/*.ts"
    ],
    "subscribers": [
        "src/models/subscriber/**/*.ts"
    ],
})
    .then((r) => {
        console.log("Connection created successfully.");
    })
    .catch((e) => {
        console.log("Error initializing the connection!");
        console.log(e);
    });

export default app;
