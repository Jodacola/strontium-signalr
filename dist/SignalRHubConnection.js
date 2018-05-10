var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SrServiceResponse, Log } from "react-strontium";
import { HubConnectionBuilder } from "@aspnet/signalr";
export class SignalRHubConnection {
    constructor(options) {
        this.options = options;
    }
    initialize(cb, reinit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validateOptions(this.options)) {
                cb(false);
                return;
            }
            this._hubConnection = new HubConnectionBuilder().withUrl(this.options.hubUrl).build();
            this._hubConnection.onclose(e => this.onClosed(e));
            this.options.handled.forEach(v => this._hubConnection.on(v, args => this.onMessage(v, args)));
            try {
                yield this._hubConnection.start();
                cb(true);
            }
            catch (_a) {
                this._hubConnection = undefined;
                cb(false);
            }
        });
    }
    validateOptions(options) {
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
    onMessage(message, args) {
        if (this.onServerMessage) {
            let resp = new SrServiceResponse();
            resp.action = message;
            resp.good = true;
            resp.data = args;
            this.onServerMessage(resp);
        }
    }
    onClosed(e) {
        this._hubConnection = undefined;
        if (e) {
            Log.e(this, 'Error on SignalR close', { error: e });
        }
    }
    sendRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected()) {
                try {
                    let resp = yield this._hubConnection.invoke(request.action, request.content);
                    this.processResponse(request, resp);
                }
                catch (err) {
                    if (this.onFailedRequest) {
                        this.onFailedRequest(request, err);
                    }
                }
            }
        });
    }
    processResponse(request, response) {
        let resp = new SrServiceResponse(request);
        resp.good = true;
        resp.data = response;
        if (this.onResponse) {
            this.onResponse(resp);
        }
    }
    connected() {
        return !!this._hubConnection;
    }
}
//# sourceMappingURL=SignalRHubConnection.js.map