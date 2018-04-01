import { runtime, IApiConnection, SrServiceResponse, SrServiceRequest, Log } from "strontium";
import { HubConnection } from "@aspnet/signalr"

export interface ISignalRConnectionOptions {
    hubUrl: string,
    handled: string[]
}

export class SignalRHubConnection implements IApiConnection {
    private _hubConnection: HubConnection;

    constructor(public options: ISignalRConnectionOptions) {

    }

    public async initialize(cb: (s: boolean) => void, reinit: boolean) {
        if (!this.validateOptions(this.options)) {
            cb(false);
            return;
        }

        this._hubConnection = new HubConnection(this.options.hubUrl);
        this._hubConnection.onclose(e => this.onClosed(e));
        this.options.handled.forEach(v => this._hubConnection.on(v, args => this.onMessage(v, args)));
        try {
            await this._hubConnection.start();
            cb(true);
        }
        catch {
            this._hubConnection = undefined;
            cb(false);
        }
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
        runtime.messaging.broadcast('DirectSignalRMessage', false, { message: message, args: args });
    }

    private onClosed(e: Error) {
        this._hubConnection = undefined;
        if (e) {
            Log.e(this, 'Error on SignalR close', { error: e });
        }
    }

    public async  sendRequest(request: SrServiceRequest) {
        if (this.connected()) {
            let resp = await this._hubConnection.invoke(request.action, request.content);

        }
    }

    connected(): boolean {
        return !!this._hubConnection;
    }

    onResponse: (resp: SrServiceResponse) => void;
    onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
    onServerMessage: (resp: SrServiceResponse) => void;
}