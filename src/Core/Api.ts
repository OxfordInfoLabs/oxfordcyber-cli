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
     * Convenient ping method
     */
    public ping(){
        return this.callMethod("/cli/util/ping");
    }

    /**
     * Call a method on the remote web service, using the passed options.
     */
    public callMethod(requestPath: string, method: string = "GET", params: any = {}, payload: any = null, returnClass: any = "string"): any {

        return new Promise((resolve, reject) => {


            let url = this._config.apiEndpoint + "/" + requestPath;

            let macAddress: string = "";
            getMAC.getMac((err: any, returnedAddress: any) => {

                macAddress = returnedAddress;


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

        });


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
