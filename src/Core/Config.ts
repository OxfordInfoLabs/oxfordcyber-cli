/**
 * Configuration class
 */
import * as os from "os";
import * as fs from "fs";

export default class Config {

    private _apiEndpoint = "https://webservices.oxfordcyber.uk";
    private _userTokenFilePath = os.homedir() + "/.oxfordcyber";
    private _userToken: string = "";

    private static _instance: Config;

    // Create a new instance of this config object.
    constructor(userTokenFilePath?: string, endpointMode?: string) {
        if (userTokenFilePath)
            this._userTokenFilePath = userTokenFilePath;

        this._resolveEndpoint(endpointMode);
        this._loadUserToken();
    }


    // Get the singleton instance.
    public static instance() {
        if (!Config._instance)
            Config._instance = new Config();

        return Config._instance;
    }


    /**
     * Get the user token if set
     */
    get userToken(): string {
        return this._userToken;
    }

    /**
     * Set the user token to a new value.
     *
     * @param value
     */
    set userToken(value: string) {
        this._userToken = value;
        fs.writeFileSync(this._userTokenFilePath, value);
    }


    get apiEndpoint(): string {
        return this._apiEndpoint;
    }

// Resolve the api endpoint
    private _resolveEndpoint(endpointMode?: string) {
        if (endpointMode == "dev" || process.argv.indexOf("dev")) {
            this._apiEndpoint = "http://127.0.0.1:3000";
        } else if (endpointMode == "test" || process.argv.indexOf("test")) {
            this._apiEndpoint = "https://webservices.oxfordcyber-test.uk";
        } else if (endpointMode == "preview" || process.argv.indexOf("preview")) {
            this._apiEndpoint = "https://webservices.oxfordcyber-preview.uk";
        }
    }

    // Load the current user token from the file if set.
    private _loadUserToken() {
        if (fs.existsSync(this._userTokenFilePath)) {
            this._userToken = fs.readFileSync(this._userTokenFilePath).toString().trim();
        }
    }
};
