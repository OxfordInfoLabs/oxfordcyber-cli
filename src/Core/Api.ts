import Config from "./Config";

var syncRequest = require('sync-request');
var asyncRequest = require('then-request');
var getMAC = require('getmac');

/**
 * Authentication functions
 */
export default class Api {

    private _config: Config;

    /**
     * Construct with a config object
     *
     * @param config
     * @param inquirer
     */
    constructor(config?: Config) {
        this._config = config ? config : Config.instance();
    }


    /**
     * Call sync method
     *
     * @param requestPath
     * @param method
     * @param params
     * @param payload
     * @param returnClass
     */
    public callSyncMethod(requestPath: string, method: string = "GET", params: any = {}, payload: any = null, returnClass: any): any {
        return this.callMethod(requestPath, method, params, payload, returnClass, true);
    }


    /**
     * Call ssync method
     *
     * @param requestPath
     * @param method
     * @param params
     * @param payload
     * @param returnClass
     */
    public callAsyncMethod(requestPath: string, method: string = "GET", params: any = {}, payload: any = null, returnClass: any): Promise<any> {
        return this.callMethod(requestPath, method, params, payload, returnClass, false);
    }


    /**
     * Call a method on the remote web service, using the passed options.
     */
    protected callMethod(requestPath: string, method: string = "GET", params: any = {}, payload: any = null, returnClass: any, synchronous: boolean): any {

        let url = this._config.apiEndpoint + "/" + requestPath;

        let macAddress: string = "";
        getMAC.getMac((err: any, returnedAddress: any) => {
            macAddress = returnedAddress;
        });

        let authParams = {
            "userAccessToken": this._config.userToken,
            "secondaryToken": macAddress
        };


        let getParams: any = Object.assign({}, authParams);

        // Also assign any params to the object.
        getParams = Object.assign(getParams, params);

        let paramsAsStrings: string[] = [];
        Object.keys(getParams).forEach(function (key) {
            if (getParams[key] !== undefined)
                paramsAsStrings.push(key + "=" + getParams[key]);
        });

        if (paramsAsStrings.length > 0)
            url += "?" + paramsAsStrings.join("&");

        // If we have a payload, ensure we remap _ properties back in object modes
        if (payload) {
            payload = this._processPayload(payload);
        }


        if (synchronous) {

            var res = syncRequest(method, url, payload ? {
                json: payload
            } : null);

            var rawBody = res.body.toString();
            var body = rawBody ? JSON.parse(res.body.toString()) : {message: null};

            if (res.statusCode != 200) {
                throw (body.message);
            } else {
                return this._processReturnValue(body, returnClass);
            }


        } else {

            return new Promise((resolve, reject) => {

                asyncRequest(method, url, payload ? {
                    json: payload
                } : null).done((res: any) => {

                    var rawBody = res.body.toString();
                    var body = rawBody ? JSON.parse(res.body.toString()) : {message: null};

                    if (res.statusCode != 200) {
                        reject(body.message);
                    } else {
                        resolve(this._processReturnValue(body, returnClass));
                    }
                });

            });

        }

    }


    // Process a return value and ensure we get the correct class.
    private _processReturnValue(returnValue: any, returnValueClass: any) {

        // If we are primitive, quit
        if (typeof returnValueClass == "string") {
            return returnValue;
        } else {

            if (Array.isArray(returnValue)) {

                let newArray: any[] = [];
                returnValue.forEach((entry) => {
                    newArray.push(this._processReturnValue(entry, returnValueClass));
                });

                return newArray;

            } else {

                var newObject = new returnValueClass();
                newObject.__setData(returnValue);
                return newObject;

            }

        }


    }


    // Process the payload getting data
    private _processPayload(payload: any): any {

        if (Array.isArray(payload)) {
            let newPayload: any[] = [];
            payload.forEach(entry => {
                newPayload.push(this._processPayload(entry));
            });
            return newPayload;
        } else {
            return payload;
        }
    }


}
