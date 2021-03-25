import createError from 'http-errors';
import express from 'express';
import { Request, Response, NextFunction } from "express";
import morgan from 'morgan';
import helmet from "helmet";
import compression from 'compression';

import indexRouter from './routes';
import testApiRouter from './routes/testApi';
import tableTestApiRouter from './routes/tableTestApi'

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

export default app;
