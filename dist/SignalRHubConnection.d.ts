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
    private startConnection;
    private enqueueReconnect;
    private validateOptions;
    private onMessage;
    private onClosed;
    sendRequest(request: SrServiceRequest): Promise<void>;
    private processResponse;
    connected(): boolean;
    onResponse: (resp: SrServiceResponse) => void;
    onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
    onServerMessage: (resp: SrServiceResponse) => void;
}
