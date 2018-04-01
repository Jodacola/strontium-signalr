import { IApiConnection, SrServiceResponse, SrServiceRequest } from "strontium";
export interface ISignalRConnectionOptions {
    hubUrl: string;
    handled: string[];
}
export declare class SignalRHubConnection implements IApiConnection {
    options: ISignalRConnectionOptions;
    private _hubConnection;
    private _connected;
    constructor(options: ISignalRConnectionOptions);
    initialize(cb: (s: boolean) => void, reinit: boolean): Promise<void>;
    private validateOptions(options);
    private onMessage(message, args);
    private onClosed(e);
    sendRequest(request: SrServiceRequest): Promise<void>;
    connected(): boolean;
    onResponse: (resp: SrServiceResponse) => void;
    onFailedRequest: (req: SrServiceRequest, error: any[]) => void;
    onServerMessage: (resp: SrServiceResponse) => void;
}
