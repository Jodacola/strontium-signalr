import { IApiConnection, SrServiceResponse, SrServiceRequest } from "react-strontium";
export interface ISignalRConnectionOptions {
    hubUrl: string;
    handled: string[];
    reconnectOnClose?: boolean;
    reconnectAttemptInterval?: number;
}
export declare class SignalRHubConnection implements IApiConnection {
    options: ISignalRConnectionOptions;
    private _hubConnection;
    private _initialized;
    constructor(options: ISignalRConnectionOptions);
    initialize(cb: (s: boolean) => void, reinit: boolean): Promise<void>;
    private startConnection(callback, reconnect?);
    private enqueueReconnect();
    private validateOptions(options);
    private onMessage(message, args);
    private onClosed(e);
    sendRequest(request: SrServiceRequest): Promise<void>;
    private processResponse(request, response);
    connected(): boolean;
    onResponse: (resp: SrServiceResponse) => void;
    onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
    onServerMessage: (resp: SrServiceResponse) => void;
}
