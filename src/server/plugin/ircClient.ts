/**
 * @license
 * Copyright (C) 2017  Jonas Bürkel
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as api             from 'twitchr-plugin-api';
import * as debug           from 'debug';
import { Client, IMessage } from 'irc';

import { getPlugins, Plugin } from './pluginManager';
import { HookCollection }     from './hookCollection';
import { IrcContext }         from './ircContext';

const debugIrc: debug.IDebugger = debug('twitchr:irc');

export class IrcClient {
    private client: Client;
    private isRunning: boolean;
    private plugins: Array<Plugin>;

    constructor(private name: string, token: string) {
        this.client = new Client('irc.chat.twitch.tv', name, {
            autoConnect: false,
            floodProtection: true,
            floodProtectionDelay: 500,
            password: 'oauth:' + token,
            port: 443,
            secure: true,
        });
    }

    getIsRunning(): boolean {
        return this.isRunning;
    }

    init(): IrcClient {
        this.isRunning = false;
        this.plugins = getPlugins();

        const hooks: HookCollection = new HookCollection(this.plugins);

        this.client.addListener('join', (channel: string, nick: string, message: IMessage) => {
            const args: api.IrcJoin = { user: nick };
            const context: IrcContext<api.IrcJoin> = new IrcContext<api.IrcJoin>(this.name, this.client, args);
            hooks.getJoinHooks().forEach((hook: api.PluginHook<api.IrcJoin>) => hook(context));
        });

        this.client.addListener('message', (nick: string, to: string, text: string, message: IMessage) => {
            const args: api.IrcMessage = { user: nick, text: text };
            const context: IrcContext<api.IrcMessage> = new IrcContext<api.IrcMessage>(this.name, this.client, args);
            hooks.getMessageHooks().forEach((hook: api.PluginHook<api.IrcMessage>) => hook(context));
        });

        this.client.addListener('names', (channel: string, nicks: string[]) => {
            const args: api.IrcNames = { users: nicks };
            const context: IrcContext<api.IrcNames> = new IrcContext<api.IrcNames>(this.name, this.client, args);
            hooks.getNamesHooks().forEach((hook: api.PluginHook<api.IrcNames>) => hook(context));
        });

        this.client.addListener('part', (channel: string, nick: string, reason: string, message: IMessage) => {
            const args: api.IrcPart = { user: nick };
            const context: IrcContext<api.IrcPart> = new IrcContext<api.IrcPart>(this.name, this.client, args);
            hooks.getPartHooks().forEach((hook: api.PluginHook<api.IrcPart>) => hook(context));
        });

        this.client.addListener('error', (message: IMessage) => {
            const error: string = JSON.stringify(message);
            debugIrc(`${this.name} error: ${error}`);
        });

        return this;
    }

    start(done?: () => void): void {
        if (this.getIsRunning()) {
            typeof done === 'function' && done();
            return;
        }

        const channel: string = '#' + this.name;

        this.client.connect(() => {
            this.client.send('CAP', 'REQ', 'twitch.tv/membership');

            this.client.join(channel, () => {
                this.client.say(channel, 'Chat moderation is started');
                this.isRunning = true;
                debugIrc(`${this.name} started successfully`);

                typeof done === 'function' && done();
            });
        });
    }

    stop(done?: () => void): void {
        if (!this.getIsRunning()) {
            typeof done === 'function' && done();
            return;
        }

        const channel: string = '#' + this.name;

        this.client.say(channel, 'Chat moderation is stopped');
        this.client.part(channel, () => {
            this.client.disconnect(() => {
                this.isRunning = false;
                debugIrc(`${this.name} stopped successfully`);

                typeof done === 'function' && done();
            });
        });
    }
}
