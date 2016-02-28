'use strict';

import * as connectMongo from 'connect-mongo';
import * as express from 'express';
import * as logger from 'morgan';
import * as session from 'express-session';
import {join} from 'path';
import {loadJsonSync} from './util/json';

import core from './core/router';
import oauth from './oauth/router';

let app = express();
let MongoStore = connectMongo(session);
let paths = loadJsonSync(join(__dirname, '../../paths.conf.json'));

app.use(logger('dev'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: '' // TODO set up MongoDB
    })
}));
app.use(express.static(join(__dirname, '../..', paths.dist.client)));

app.use('/api/oauth2', oauth);

app.use(core);

export default app;
