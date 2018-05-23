import { runtime, IApiConnection, SrServiceResponse, SrServiceRequest, Log } from "react-strontium";
import { HubConnection, HubConnectionBuilder } from "@aspnet/signalr"

export interface ISignalRConnectionOptions {
    hubUrl: string,
    handled: string[],
    reconnectOnClose?: boolean,
    reconnectAttemptInterval?: number
}

export class SignalRHubConnection implements IApiConnection {
    private _hubConnection: HubConnection;
    private _initialized: boolean;

    constructor(public options: ISignalRConnectionOptions) {

    }

    public async initialize(cb: (s: boolean) => void, reinit: boolean) {
        if (!this.validateOptions(this.options)) {
            cb(false);
            return;
        }

        this._hubConnection = new HubConnectionBuilder().withUrl(this.options.hubUrl).build();
        this._hubConnection.onclose(e => this.onClosed(e));
        this.options.handled.forEach(v => this._hubConnection.on(v, args => this.onMessage(v, args)));
        await this.startConnection(cb);
    }

    private async startConnection(callback: (s: boolean) => void, reconnect: boolean = false) {
        try {
            await this._hubConnection.start();
            this._initialized = true;
            if (callback && !reconnect) {
                callback(true);
            }
        }
        catch {
            if (!reconnect) {
                this._hubConnection = undefined;
                if (callback) {
                    callback(false);
                }
            } else {
                this.enqueueReconnect();
            }
        }
    }

    private enqueueReconnect() {
        window.setTimeout(() => {
            Log.d(this, 'Attempting SignalR reconnect');
            this.startConnection(null, true);
        }, Math.max(this.options.reconnectAttemptInterval || 0, 10000));
    }

    private validateOptions(options: ISignalRConnectionOptions): boolean {
        if (!options) {
            Log.w(this, 'Invalid SignalR Connection options');
            return false;
        }

        if (!options.hubUrl) {
            Log.w(this, 'Invalid SignalR Hub URL');
            return false;
        }

        if (!(options.handled || []).length) {
            Log.w(this, 'No handled SignalR messages');
            return false;
        }

        return true;
    }

    private onMessage(message: string, args: any[]) {
        if (this.onServerMessage) {
            let resp = new SrServiceResponse();
            resp.action = message;
            resp.good = true;
            resp.data = args;
            this.onServerMessage(resp);
        }
    }

    private onClosed(e: Error) {
        if (e) {
            Log.e(this, 'Error on SignalR close', { error: e });
        }

        this._initialized = false;

        if (this.options.reconnectOnClose === true) {
            this.enqueueReconnect();
        } else {
            this._hubConnection = undefined;
        }
    }

    public async sendRequest(request: SrServiceRequest) {
        if (this.connected()) {
            try {
                let resp = await this._hubConnection.invoke(request.action, request.content);
                this.processResponse(request, resp);
            } catch (err) {
                if (this.onFailedRequest) {
                    this.onFailedRequest(request, err);
                }
            }
        }
    }

    private processResponse(request: SrServiceRequest, response: any) {
        let resp = new SrServiceResponse(request);
        resp.good = true;
        resp.data = response;

        if (this.onResponse) {
            this.onResponse(resp);
        }
    }

    connected(): boolean {
        return !!this._hubConnection;
    }

    onResponse: (resp: SrServiceResponse) => void;
    onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
    onServerMessage: (resp: SrServiceResponse) => void;
}