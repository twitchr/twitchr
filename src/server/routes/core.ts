/*!
    twitchr - A twitch bot providing IRC based assistance
    Copyright (C) 2016  Jonas Bürkel

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import * as express from 'express';
import {rejectAuth, requireAuth} from '../util/misc';
import {resolve} from 'app-root-path';

let router = express.Router();

router.get('/login', rejectAuth, (req: express.Request, res: express.Response) => {
    res.sendFile(resolve('./dist/client/index.html'));
});

router.get('/logout', requireAuth, (req: express.Request, res: express.Response) => {
    req.session.destroy((err: any) => {
        res.redirect('/login');
    });
});

router.get('/*', (req: express.Request, res: express.Response) => {
    res.sendFile(resolve('./dist/client/index.html'));
});

export default router;