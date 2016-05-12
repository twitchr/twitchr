/*!
    twitchr - A twitch bot providing IRC based assistance
    Copyright (C) 2016  Jonas Bürkel

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {Http, Response} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RestService {
    private _oauthRoute: string = '/api/oauth2';

    public constructor(private _http: Http) { }

    public getOauthUrl(): Observable<string> {
        return this._http.get(this._oauthRoute)
            .map(this._extractData)
            .catch(this._handleError);
    }

    private _extractData(res: Response): Object {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }

        let body: RestResponse = res.json();
        return body.data || { };
    }

    private _handleError(error: any): Observable<string> {
        let message: string = error.message || 'Server error';
        console.error(message);
        return Observable.throw(message);
    }
}

interface RestResponse {
    data: Object;
}